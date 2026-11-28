import { POST_SELECT, authorName, publicPost } from '../../../../utils/community'
import type { PostRow } from '../../../../utils/community'
import { postNotMembersOnlySql } from '../../../../utils/memberOnly'
import { requireApiClient } from '../../../../utils/apiAuth'

export default defineEventHandler(async (event) => {
  await requireApiClient(event, 'community:read')
  const id = getRouterParam(event, 'id') ?? ''
  const db = useDB(event)
  const row = await db.prepare(`SELECT ${POST_SELECT} WHERE p.id = ? AND p.hidden = 0 AND ${postNotMembersOnlySql}`).bind(id).first<PostRow>()
  if (!row) throw createError({ statusCode: 404, statusMessage: '글을 찾을 수 없어요' })
  const { results } = await db
    .prepare(`SELECT c.id, c.body, c.created_at, m.nickname, m.role AS author_role
      FROM community_comments c LEFT JOIN members m ON m.id = c.member_id
      WHERE c.post_id = ? AND c.hidden = 0 ORDER BY c.created_at ASC LIMIT 200`)
    .bind(id)
    .all<{ id: string, body: string, created_at: string, nickname: string | null, author_role: string | null }>()
  return {
    post: publicPost(row, null, true),
    comments: results.map(c => ({ id: c.id, body: c.body, author: authorName(c.nickname), authorIsAdmin: c.author_role === 'admin', createdAt: c.created_at }))
  }
})
