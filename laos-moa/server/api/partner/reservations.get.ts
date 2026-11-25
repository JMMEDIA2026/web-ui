export default defineEventHandler(async (event) => {
  const partner = await requirePartner(event)

  // 로그인한 협력업체의 예약만 조회합니다.
  const { results } = await useDB(event)
    .prepare(
      `SELECT id, customer_name, customer_contact, service, reserve_date, people, note, status, partner_memo, created_at
       FROM reservations WHERE partner_id = ?
       ORDER BY CASE status WHEN 'pending' THEN 0 WHEN 'confirmed' THEN 1 ELSE 2 END, reserve_date ASC, created_at DESC
       LIMIT 300`
    )
    .bind(partner.id)
    .all()

  return results
})
