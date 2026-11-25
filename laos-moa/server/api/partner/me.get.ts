export default defineEventHandler(async (event) => {
  const partner = await requirePartner(event)
  return { id: partner.id, name: partner.name, category: partner.category }
})
