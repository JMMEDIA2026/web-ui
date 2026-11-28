import { reservationFullView } from '../../../utils/apiViews'
import { requireApiClient } from '../../../utils/apiAuth'

// 예약 한 건 (업체 메모 포함). 예약 처리용이라 reservations:manage 권한이 필요해요.
export default defineEventHandler(async (event) => {
  await requireApiClient(event, 'reservations:manage')
  const id = getRouterParam(event, 'id') ?? ''
  const row = await useDB(event).prepare('SELECT * FROM reservations WHERE id = ?').bind(id).first<Record<string, unknown>>()
  if (!row) throw createError({ statusCode: 404, statusMessage: '예약을 찾을 수 없어요' })
  return { reservation: reservationFullView(row) }
})
