// 관리자 미리보기용 배너 이미지 (숨김·예약·종료 배너도 볼 수 있음)
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id') ?? ''
  const row = await useDB(event).prepare('SELECT image_b64, mime FROM banners WHERE id = ?').bind(id).first<{ image_b64: string, mime: string }>()
  const bytes = row ? decodeBase64(row.image_b64) : null
  if (!row || !bytes) throw createError({ statusCode: 404, statusMessage: '배너를 찾을 수 없습니다' })
  return new Response(bytes, { headers: { 'content-type': row.mime, 'cache-control': 'private, no-store', 'x-content-type-options': 'nosniff' } })
})
