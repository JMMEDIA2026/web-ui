// 배너 삭제 (관리자)
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id') ?? ''
  const r = await useDB(event).prepare('DELETE FROM banners WHERE id = ?').bind(id).run()
  if (!r.success) throw createError({ statusCode: 500, statusMessage: '삭제하지 못했습니다' })
  return { ok: true }
})
