export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const { results } = await useDB(event)
    .prepare('SELECT id, company, contact, product, message, status, created_at FROM inquiries ORDER BY created_at DESC LIMIT 300')
    .all()

  return results
})
