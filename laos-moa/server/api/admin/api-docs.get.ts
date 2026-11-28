// API 연동 가이드(docs/API.md)를 파일로 내려받습니다. 관리자만 받을 수 있어요.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const raw = await useStorage('assets:docs').getItemRaw('API.md')
  if (!raw) throw createError({ statusCode: 404, statusMessage: '문서를 찾을 수 없어요' })
  const text = typeof raw === 'string' ? raw : new TextDecoder().decode(raw as ArrayBuffer | Uint8Array)
  setResponseHeader(event, 'content-type', 'text/markdown; charset=utf-8')
  setResponseHeader(event, 'content-disposition', 'attachment; filename="laja-api-guide.md"')
  setResponseHeader(event, 'cache-control', 'no-store')
  return text
})
