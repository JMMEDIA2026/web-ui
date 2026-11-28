import { z } from 'zod'
import { AUTO_HIDE_REPORTS } from '../../utils/community'

// 신고: 한 사람이 같은 글(댓글)을 한 번만 신고할 수 있어요. 3번 쌓이면 자동으로 숨기고 운영자에게 알려요.
export default defineEventHandler(async (event) => {
  assertSameOrigin(event)
  const member = await requireMember(event)
  const data = await parseBody(event, z.object({
    type: z.enum(['post', 'comment'], { message: '신고할 대상을 확인해 주세요' }),
    id: z.string().trim().min(1).max(40),
    reason: z.string().trim().max(200).default('')
  }))
  const db = useDB(event)
  const who = `m:${member.id}`
  if (await rateCount(db, who, 'community-report', 10 * 60 * 1000) >= 10) {
    throw createError({ statusCode: 429, statusMessage: '신고를 너무 자주 하고 있어요. 잠시 후 다시 시도해 주세요' })
  }

  const table = data.type === 'post' ? 'community_posts' : 'community_comments'
  const target = await db.prepare(`SELECT member_id FROM ${table} WHERE id = ?`).bind(data.id).first<{ member_id: string }>()
  if (!target) throw createError({ statusCode: 404, statusMessage: '대상을 찾을 수 없어요' })
  if (target.member_id === member.id) throw createError({ statusCode: 400, statusMessage: '내가 쓴 글은 신고할 수 없어요' })

  const dup = await db
    .prepare('SELECT 1 AS x FROM community_reports WHERE target_type = ? AND target_id = ? AND member_id = ?')
    .bind(data.type, data.id, member.id)
    .first()
  if (dup) return { ok: true, already: true }

  await db
    .prepare('INSERT INTO community_reports (id, target_type, target_id, member_id, reason, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(`X${randomCode(8)}`, data.type, data.id, member.id, data.reason, nowIso())
    .run()
  await rateAdd(db, who, 'community-report')

  const n = await db
    .prepare('SELECT COUNT(*) AS n FROM community_reports WHERE target_type = ? AND target_id = ?')
    .bind(data.type, data.id)
    .first<{ n: number }>()
  const count = n?.n ?? 0
  await db.prepare(`UPDATE ${table} SET report_count = ?, hidden = CASE WHEN ? >= ? THEN 1 ELSE hidden END WHERE id = ?`).bind(count, count, AUTO_HIDE_REPORTS, data.id).run()
  if (data.type === 'comment') {
    await db
      .prepare('UPDATE community_posts SET comment_count = (SELECT COUNT(*) FROM community_comments WHERE post_id = (SELECT post_id FROM community_comments WHERE id = ?) AND hidden = 0) WHERE id = (SELECT post_id FROM community_comments WHERE id = ?)')
      .bind(data.id, data.id)
      .run()
  }
  if (count === 1 || count === AUTO_HIDE_REPORTS) {
    await notify(event, `[라자] 커뮤니티 신고 ${count}건\n대상: ${data.type === 'post' ? '글' : '댓글'} ${data.id}\n사유: ${data.reason || '(없음)'}${count >= AUTO_HIDE_REPORTS ? '\n신고가 쌓여 자동으로 숨겼어요. 관리자 > 커뮤니티에서 확인해 주세요.' : ''}`)
  }
  return { ok: true }
})
