import { BOARD_KEYS, POST_SELECT, publicPost } from '../../../../utils/community'
import type { PostRow } from '../../../../utils/community'
import { postNotMembersOnlySql } from '../../../../utils/memberOnly'
import { pageParams, requireApiClient } from '../../../../utils/apiAuth'

// 커뮤니티 글 목록. 숨김 처리된 글은 나오지 않습니다. ?board=review&business=<업체id>
export default defineEventHandler(async (event) => {
  await requireApiClient(event, 'community:read')
  const { limit, offset } = pageParams(event)
  const q = getQuery(event)
  const board = typeof q.board === 'string' && (BOARD_KEYS as readonly string[]).includes(q.board) ? q.board : ''
  const business = typeof q.business === 'string' ? q.business.slice(0, 60) : ''
  const where = ['p.hidden = 0', postNotMembersOnlySql]
  const args: unknown[] = []
  if (board) { where.push('p.board = ?'); args.push(board) }
  if (business) { where.push('p.business_id = ?'); args.push(business) }

  const db = useDB(event)
  const total = await db.prepare(`SELECT COUNT(*) AS n FROM community_posts p WHERE ${where.join(' AND ')}`).bind(...args).first<{ n: number }>()
  const { results } = await db
    .prepare(`SELECT ${POST_SELECT} WHERE ${where.join(' AND ')} ORDER BY p.created_at DESC, p.id LIMIT ? OFFSET ?`)
    .bind(...args, limit, offset)
    .all<PostRow>()
  return { total: total?.n ?? 0, limit, offset, items: results.map(r => publicPost(r, null, true)) }
})
