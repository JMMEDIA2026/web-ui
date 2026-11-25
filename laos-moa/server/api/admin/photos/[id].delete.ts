// 업체 사진 삭제 (관리자). 대표 사진을 지우면 남은 사진 중 가장 앞의 사진이 대표가 됩니다.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id') ?? ''
  const db = useDB(event)

  const photo = await db.prepare('SELECT business_id, is_cover FROM business_photos WHERE id = ?').bind(id).first<{ business_id: string, is_cover: number }>()
  if (!photo) throw createError({ statusCode: 404, statusMessage: '사진을 찾을 수 없습니다' })

  await db.prepare('DELETE FROM business_photos WHERE id = ?').bind(id).run()
  if (photo.is_cover) {
    await db
      .prepare(
        `UPDATE business_photos SET is_cover = 1
         WHERE id = (SELECT id FROM business_photos WHERE business_id = ? ORDER BY sort_order, created_at LIMIT 1)`
      )
      .bind(photo.business_id)
      .run()
  }
  await db.prepare('UPDATE businesses SET updated_at = ? WHERE id = ?').bind(nowIso(), photo.business_id).run()
  return { ok: true }
})
