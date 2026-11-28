import { hasMemberAccess } from '../../../utils/memberOnly'
import { MEMBERS_CATEGORY } from '../../../utils/constants'

// 게시글 한 개와 댓글 (누구나 볼 수 있어요). 숨김 글은 글쓴이와 관리자만 볼 수 있어요.
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') ?? ''
  const db = useDB(event)
  const viewer = await readMemberId(event)

  const row = await db.prepare(`SELECT ${POST_SELECT} WHERE p.id = ?`).bind(id).first<PostRow>()
  const admin = await isAdminRequest(event)
  if (!row || (row.hidden && !admin && row.member_id !== viewer)) {
    throw createError({ statusCode: 404, statusMessage: '글을 찾을 수 없어요' })
  }
  if (row.business_id && !(await hasMemberAccess(event))) {
    const mb = await db.prepare('SELECT category FROM businesses WHERE id = ?').bind(row.business_id).first<{ category: string }>()
    if (mb?.category === MEMBERS_CATEGORY) throw createError({ statusCode: 404, statusMessage: '글을 찾을 수 없어요' })
  }

  const { results } = await db
    .prepare(`SELECT c.id, c.body, c.member_id, c.hidden, c.created_at, m.nickname, m.role AS author_role
      FROM community_comments c LEFT JOIN members m ON m.id = c.member_id
      WHERE c.post_id = ? ${admin ? '' : 'AND c.hidden = 0'} ORDER BY c.created_at ASC LIMIT 200`)
    .bind(id)
    .all<{ id: string, body: string, member_id: string, hidden: number, created_at: string, nickname: string | null, author_role: string | null }>()

  const liked = viewer
    ? !!(await db.prepare('SELECT 1 AS x FROM community_likes WHERE post_id = ? AND member_id = ?').bind(id, viewer).first())
    : false

  return {
    post: { ...publicPost(row, viewer), hidden: !!row.hidden },
    liked,
    canModerate: admin,
    comments: results.map(c => ({
      id: c.id,
      body: c.body,
      author: authorName(c.nickname),
      authorIsAdmin: c.author_role === 'admin',
      mine: !!viewer && c.member_id === viewer,
      hidden: !!c.hidden,
      createdAt: c.created_at
    }))
  }
})
