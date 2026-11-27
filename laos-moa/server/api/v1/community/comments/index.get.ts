import { z } from 'zod'
import { postNotMembersOnlySql } from '../../../../utils/memberOnly'
import { authorName } from '../../../../utils/community'
import { pageParams, requireApiClient } from '../../../../utils/apiAuth'

// 댓글 목록 (숨김 처리된 댓글·글, 회원전용 업체의 글에 달린 댓글은 제외). ?postId=글id&since=시각
export default defineEventHandler(async (event) => {
  await requireApiClient(event, 'community:read')
  const { limit, offset } = pageParams(event)
  const q = z.object({ postId: z.string().max(30).optional(), since: z.string().max(40).optional() }).parse(getQuery(event))
  const db = useDB(event)
  const where = `c.hidden = 0 AND p.hidden = 0 AND ${postNotMembersOnlySql} AND (? = '' OR c.post_id = ?) AND (? = '' OR c.created_at >= ?)`
  const binds = [q.postId ?? '', q.postId ?? '', q.since ?? '', q.since ?? '']
  const total = await db.prepare(`SELECT COUNT(*) AS n FROM community_comments c JOIN community_posts p ON p.id = c.post_id WHERE ${where}`).bind(...binds).first<{ n: number }>()
  const { results } = await db
    .prepare(
      `SELECT c.id, c.post_id, c.body, c.created_at, m.nickname, m.role AS author_role
       FROM community_comments c
       JOIN community_posts p ON p.id = c.post_id
       LEFT JOIN members m ON m.id = c.member_id
       WHERE ${where} ORDER BY c.created_at DESC, c.id LIMIT ? OFFSET ?`
    )
    .bind(...binds, limit, offset)
    .all<{ id: string, post_id: string, body: string, created_at: string, nickname: string | null, author_role: string | null }>()
  return {
    total: total?.n ?? 0,
    limit,
    offset,
    items: results.map(c => ({ id: c.id, postId: c.post_id, body: c.body, author: authorName(c.nickname), authorIsAdmin: c.author_role === 'admin', createdAt: c.created_at }))
  }
})
