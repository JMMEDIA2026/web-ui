import { API_SCOPES } from '../../utils/apiAuth'

// 발급한 API 키 목록. 키 원문은 저장하지 않으므로 앞 12글자만 보여 줍니다.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { results } = await useDB(event)
    .prepare('SELECT id, name, key_prefix, scopes, rate_per_min, active, created_at, last_used_at, request_count FROM api_clients ORDER BY created_at DESC')
    .all<Record<string, unknown>>()
  return {
    scopes: Object.entries(API_SCOPES).map(([key, label]) => ({ key, label })),
    clients: results.map(r => ({
      id: r.id,
      name: r.name,
      keyPrefix: r.key_prefix,
      scopes: String(r.scopes).split(',').filter(Boolean),
      ratePerMin: r.rate_per_min,
      active: r.active === 1,
      createdAt: r.created_at,
      lastUsedAt: r.last_used_at || null,
      requestCount: r.request_count
    }))
  }
})
