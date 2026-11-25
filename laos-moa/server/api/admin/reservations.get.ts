import { z } from 'zod'

const query = z.object({
  status: z.enum(RESERVATION_STATUSES).optional()
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { status } = query.parse(getQuery(event))

  const { results } = await useDB(event)
    .prepare(
      `SELECT r.id, r.partner_id, COALESCE(p.name, NULLIF(r.business_name, '')) AS partner_name, r.customer_name, r.customer_contact,
              r.service, r.reserve_date, r.people, r.note, r.status, r.partner_memo, r.created_at
       FROM reservations r LEFT JOIN partners p ON p.id = r.partner_id
       WHERE (? = '' OR r.status = ?)
       ORDER BY r.created_at DESC LIMIT 300`
    )
    .bind(status ?? '', status ?? '')
    .all()

  return results
})
