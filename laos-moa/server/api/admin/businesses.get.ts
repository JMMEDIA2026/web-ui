export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const { results } = await useDB(event)
    .prepare(
      `SELECT b.id, b.name, b.category, b.area, b.address, b.lat, b.lng, b.description, b.hours, b.contact,
              b.map_url, b.partner_id, b.sponsored, b.active, b.created_at, p.name AS partner_name,
              (SELECT group_concat(id) FROM (SELECT id FROM business_photos WHERE business_id = b.id ORDER BY is_cover DESC, sort_order, created_at)) AS photo_ids
       FROM businesses b LEFT JOIN partners p ON p.id = b.partner_id
       ORDER BY b.created_at DESC`
    )
    .all()

  return results
})
