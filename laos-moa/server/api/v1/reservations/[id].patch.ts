import { z } from 'zod'
import { notifyReservationChange } from '../../../utils/reservationNotify'
import { RESERVATION_STATUSES } from '../../../utils/constants'
import { reservationFullView } from '../../../utils/apiViews'
import { requireApiClient } from '../../../utils/apiAuth'

const schema = z.object({
  status: z.enum(RESERVATION_STATUSES, { message: 'status 는 pending, confirmed, declined, completed, cancelled 중 하나예요' }).optional(),
  memo: z.string().trim().max(500, '메모는 500자까지 쓸 수 있어요').optional()
}).refine(v => v.status !== undefined || v.memo !== undefined, { message: '바꿀 status 나 memo 를 보내 주세요' })

// 예약 처리: 상태를 바꾸고 업체 메모를 남깁니다. 바뀐 내용은 회원의 "내 예약"에 바로 보여요.
export default defineEventHandler(async (event) => {
  const client = await requireApiClient(event, 'reservations:manage')
  const id = getRouterParam(event, 'id') ?? ''
  const body = await parseBody(event, schema)
  const db = useDB(event)

  const before = await db.prepare('SELECT * FROM reservations WHERE id = ?').bind(id).first<Record<string, unknown>>()
  if (!before) throw createError({ statusCode: 404, statusMessage: '예약을 찾을 수 없어요' })

  await db
    .prepare('UPDATE reservations SET status = COALESCE(?, status), partner_memo = COALESCE(?, partner_memo), updated_at = ? WHERE id = ?')
    .bind(body.status ?? null, body.memo ?? null, nowIso(), id)
    .run()

  if (body.status) await notifyReservationChange(event, id, String(before.status), body.status, `API ${client.name}`)
  const after = await db.prepare('SELECT * FROM reservations WHERE id = ?').bind(id).first<Record<string, unknown>>()
  return { ok: true, reservation: reservationFullView(after!) }
})
