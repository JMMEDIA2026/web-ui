import { z } from 'zod'

const schema = z.object({
  status: z.enum(RESERVATION_STATUSES).optional(),
  partnerMemo: z.string().trim().max(500).optional()
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id') ?? ''
  const body = await parseBody(event, schema)

  const result = await useDB(event)
    .prepare(
      `UPDATE reservations
       SET status = COALESCE(?, status), partner_memo = COALESCE(?, partner_memo), updated_at = ?
       WHERE id = ?`
    )
    .bind(body.status ?? null, body.partnerMemo ?? null, nowIso(), id)
    .run()

  if (!result.meta.changes) {
    throw createError({ statusCode: 404, statusMessage: '예약을 찾을 수 없습니다' })
  }
  return { ok: true }
})
