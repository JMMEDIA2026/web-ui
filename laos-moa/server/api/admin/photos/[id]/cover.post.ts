// 이 사진을 대표(썸네일) 사진으로 지정합니다. (관리자)
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id') ?? ''
  const db = useDB(event)

  const photo = await db.prepare('SELECT business_id FROM business_photos WHERE id = ?').bind(id).first<{ business_id: string }>()
  if (!photo) throw createError({ statusCode: 404, statusMessage: '사진을 찾을 수 없습니다' })

  await db.prepare('UPDATE business_photos SET is_cover = CASE WHEN id = ? THEN 1 ELSE 0 END WHERE business_id = ?').bind(id, photo.business_id).run()
  await db.prepare('UPDATE businesses SET updated_at = ? WHERE id = ?').bind(nowIso(), photo.business_id).run()
  return { ok: true }
})
