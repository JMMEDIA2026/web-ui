import { hasMemberAccess, postNotMembersOnlySql } from '../../utils/memberOnly'
import { BOARD_KEYS } from '../../utils/community'

// 게시글 목록 (누구나 볼 수 있어요). 숨김 처리된 글은 나오지 않습니다.
export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const board = typeof q.board === 'string' && (BOARD_KEYS as readonly string[]).includes(q.board) ? q.board : ''
  const business = typeof q.business === 'string' ? q.business.slice(0, 60) : ''
  const offset = Math.max(0, Math.min(5000, Number.parseInt(String(q.offset ?? '0'), 10) || 0))
  const limit = Math.max(1, Math.min(30, Number.parseInt(String(q.limit ?? '20'), 10) || 20))

  const where: string[] = ['p.hidden = 0']
  const args: unknown[] = []
  if (board) { where.push('p.board = ?'); args.push(board) }
  if (business) { where.push('p.business_id = ?'); args.push(business) }

  const db = useDB(event)
  const viewer = await readMemberId(event)
  // 회원전용 업체에 달린 글은 로그인한 회원에게만 보여 줍니다.
  if (!(await hasMemberAccess(event))) where.push(postNotMembersOnlySql)
  const { results } = await db
    .prepare(`SELECT ${POST_SELECT} WHERE ${where.join(' AND ')} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`)
    .bind(...args, limit + 1, offset)
    .all<PostRow>()
  const total = await db
    .prepare(`SELECT COUNT(*) AS n FROM community_posts p WHERE ${where.join(' AND ')}`)
    .bind(...args)
    .first<{ n: number }>()

  return {
    posts: results.slice(0, limit).map(r => publicPost(r, viewer, false)),
    hasMore: results.length > limit,
    total: total?.n ?? 0
  }
})
