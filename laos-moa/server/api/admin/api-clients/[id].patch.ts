import { z } from 'zod'
import { API_SCOPE_KEYS } from '../../../utils/apiAuth'

// 키의 이름·권한·사용 여부를 바꿉니다. (사용 중지하면 바로 막힙니다)
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id') ?? ''
  const data = await parseBody(event, z.object({
    name: z.string().trim().min(2).max(40).optional(),
    scopes: z.array(z.enum(API_SCOPE_KEYS as [string, ...string[]])).min(1, '권한을 하나 이상 골라 주세요').optional(),
    ratePerMin: z.coerce.number().int().min(10).max(1200).optional(),
    active: z.boolean().optional()
  }))
  const db = useDB(event)
  const row = await db.prepare('SELECT id FROM api_clients WHERE id = ?').bind(id).first()
  if (!row) throw createError({ statusCode: 404, statusMessage: '키를 찾을 수 없어요' })
  const sets: string[] = []
  const args: unknown[] = []
  if (data.name !== undefined) { sets.push('name = ?'); args.push(data.name) }
  if (data.scopes !== undefined) { sets.push('scopes = ?'); args.push([...new Set(data.scopes)].join(',')) }
  if (data.ratePerMin !== undefined) { sets.push('rate_per_min = ?'); args.push(data.ratePerMin) }
  if (data.active !== undefined) { sets.push('active = ?'); args.push(data.active ? 1 : 0) }
  if (!sets.length) return { ok: true }
  await db.prepare(`UPDATE api_clients SET ${sets.join(', ')} WHERE id = ?`).bind(...args, id).run()
  return { ok: true }
})
