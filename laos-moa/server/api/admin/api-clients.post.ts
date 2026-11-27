import { z } from 'zod'
import { API_SCOPE_KEYS, generateApiKey } from '../../utils/apiAuth'

// API 키 발급. 키 원문은 이 응답에서 딱 한 번만 보여 줍니다.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const data = await parseBody(event, z.object({
    name: z.string().trim().min(2, '사이트 이름을 입력해 주세요').max(40),
    scopes: z.array(z.enum(API_SCOPE_KEYS as [string, ...string[]])).min(1, '권한을 하나 이상 골라 주세요'),
    ratePerMin: z.coerce.number().int().min(10).max(1200).default(120)
  }))
  const db = useDB(event)
  const count = await db.prepare('SELECT COUNT(*) AS n FROM api_clients').first<{ n: number }>()
  if ((count?.n ?? 0) >= 30) throw createError({ statusCode: 400, statusMessage: '키는 30개까지 만들 수 있어요. 안 쓰는 키를 삭제해 주세요' })

  const { key, prefix, hash } = await generateApiKey()
  const id = `K${randomCode(8)}`
  await db
    .prepare('INSERT INTO api_clients (id, name, key_prefix, key_hash, scopes, rate_per_min, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(id, data.name, prefix, hash, [...new Set(data.scopes)].join(','), data.ratePerMin, nowIso())
    .run()
  return { ok: true, id, key }
})
