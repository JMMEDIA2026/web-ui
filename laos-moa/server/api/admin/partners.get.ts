export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const { results } = await useDB(event)
    .prepare(
      `SELECT p.id, p.name, p.category, p.contact, p.active, p.created_at,
        (SELECT COUNT(*) FROM reservations r WHERE r.partner_id = p.id) AS total,
        (SELECT COUNT(*) FROM reservations r WHERE r.partner_id = p.id AND r.status = 'pending') AS pending
       FROM partners p ORDER BY p.created_at DESC`
    )
    .all()

  return results
})
