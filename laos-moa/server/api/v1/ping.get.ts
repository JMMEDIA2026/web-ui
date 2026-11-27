// API 키가 잘 동작하는지 확인합니다. (권한 불필요)
export default defineEventHandler(async (event) => {
  const client = await requireApiClient(event)
  return { ok: true, client: { id: client.id, name: client.name, scopes: client.scopes, ratePerMin: client.ratePerMin }, time: new Date().toISOString() }
})
