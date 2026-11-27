import { z } from 'zod'
import { RESERVATION_STATUSES } from '../../../utils/constants'
import { reservationView } from '../../../utils/apiViews'
import { pageParams, requireApiClient } from '../../../utils/apiAuth'

export default defineEventHandler(async (event) => {
  await requireApiClient(event, 'reservations:read')
  const { limit, offset } = pageParams(event)
  const q = z.object({ status: z.enum(RESERVATION_STATUSES).optional(), memberId: z.string().max(30).optional(), since: z.string().max(40).optional() }).parse(getQuery(event))
  const db = useDB(event)
  const where = `(? = '' OR status = ?) AND (? = '' OR member_id = ?) AND (? = '' OR created_at >= ?)`
  const binds = [q.status ?? '', q.status ?? '', q.memberId ?? '', q.memberId ?? '', q.since ?? '', q.since ?? '']
  const total = await db.prepare(`SELECT COUNT(*) AS n FROM reservations WHERE ${where}`).bind(...binds).first<{ n: number }>()
  const { results } = await db
    .prepare(`SELECT * FROM reservations WHERE ${where} ORDER BY created_at DESC, id LIMIT ? OFFSET ?`)
    .bind(...binds, limit, offset)
    .all<Record<string, unknown>>()
  return { total: total?.n ?? 0, limit, offset, items: results.map(reservationView) }
})
