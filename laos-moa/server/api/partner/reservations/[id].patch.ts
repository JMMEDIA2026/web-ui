import { z } from 'zod'
import { notifyReservationChange } from '../../../utils/reservationNotify'

const schema = z.object({
  status: z.enum(PARTNER_STATUSES, { message: '변경할 수 없는 상태입니다' }).optional(),
  partnerMemo: z.string().trim().max(500).optional()
})

export default defineEventHandler(async (event) => {
  const partner = await requirePartner(event)
  const id = getRouterParam(event, 'id') ?? ''
  const body = await parseBody(event, schema)

  // 다른 업체의 예약은 바꿀 수 없도록 partner_id 조건을 함께 겁니다.
  const db = useDB(event)
  const before = await db.prepare('SELECT status FROM reservations WHERE id = ? AND partner_id = ?').bind(id, partner.id).first<{ status: string }>()
  const result = await db
    .prepare(
      `UPDATE reservations
       SET status = COALESCE(?, status), partner_memo = COALESCE(?, partner_memo), updated_at = ?
       WHERE id = ? AND partner_id = ? AND status <> 'cancelled'`
    )
    .bind(body.status ?? null, body.partnerMemo ?? null, nowIso(), id, partner.id)
    .run()

  if (!result.meta.changes) {
    throw createError({ statusCode: 404, statusMessage: '예약을 찾을 수 없거나 변경할 수 없습니다' })
  }
  if (before && body.status) await notifyReservationChange(event, id, before.status, body.status, `협력업체 ${partner.name}`)
  return { ok: true }
})
