import { z } from 'zod'

// 신고 처리: 숨기기·다시 보이기(신고 기록 지움)
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const data = await parseBody(event, z.object({
    type: z.enum(['post', 'comment']),
    id: z.string().trim().min(1).max(40),
    action: z.enum(['hide', 'show'])
  }))
  const db = useDB(event)
  const table = data.type === 'post' ? 'community_posts' : 'community_comments'
  if (data.action === 'hide') {
    await db.prepare(`UPDATE ${table} SET hidden = 1 WHERE id = ?`).bind(data.id).run()
  } else {
    await db.prepare(`UPDATE ${table} SET hidden = 0, report_count = 0 WHERE id = ?`).bind(data.id).run()
    await db.prepare('DELETE FROM community_reports WHERE target_type = ? AND target_id = ?').bind(data.type, data.id).run()
  }
  if (data.type === 'comment') {
    await db
      .prepare('UPDATE community_posts SET comment_count = (SELECT COUNT(*) FROM community_comments WHERE post_id = (SELECT post_id FROM community_comments WHERE id = ?) AND hidden = 0) WHERE id = (SELECT post_id FROM community_comments WHERE id = ?)')
      .bind(data.id, data.id)
      .run()
  }
  return { ok: true }
})
