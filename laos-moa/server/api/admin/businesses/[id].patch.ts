import { z } from 'zod'
import { isValidContactString } from '../../../../shared/utils/contact'

const schema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  category: z.enum(BUSINESS_CATEGORIES).optional(),
  area: z.string().trim().max(60).optional(),
  address: z.string().trim().max(200).optional(),
  lat: z.number().min(-90).max(90).nullable().optional(),
  lng: z.number().min(-180).max(180).nullable().optional(),
  description: z.string().trim().max(500).optional(),
  hours: z.string().trim().max(200).optional(),
  contact: z.string().trim().max(900).refine(isValidContactString, '연락처 형식을 확인하세요').optional(),
  mapUrl: z.string().trim().max(500).refine(v => v === '' || /^https:\/\//.test(v), '지도 주소는 https:// 로 시작해야 합니다').optional(),
  // 사장님(협력업체) 계정 연결. null이면 연결을 해제합니다.
  partnerId: z.string().trim().max(40).nullable().optional(),
  sponsored: z.boolean().optional(),
  active: z.boolean().optional()
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id') ?? ''
  const body = await parseBody(event, schema)
  const db = useDB(event)

  if (!(await db.prepare('SELECT id FROM businesses WHERE id = ?').bind(id).first())) {
    throw createError({ statusCode: 404, statusMessage: '업체를 찾을 수 없습니다' })
  }

  if (body.partnerId) {
    const partner = await db.prepare('SELECT id FROM partners WHERE id = ?').bind(body.partnerId).first()
    if (!partner) {
      throw createError({ statusCode: 400, statusMessage: '연결하려는 협력업체 ID가 없습니다' })
    }
  }

  const columns: Record<string, unknown> = {
    name: body.name,
    category: body.category,
    area: body.area,
    address: body.address,
    lat: body.lat,
    lng: body.lng,
    description: body.description,
    hours: body.hours,
    contact: body.contact,
    map_url: body.mapUrl,
    partner_id: body.partnerId,
    sponsored: body.sponsored === undefined ? undefined : (body.sponsored ? 1 : 0),
    active: body.active === undefined ? undefined : (body.active ? 1 : 0)
  }

  const sets: string[] = []
  const values: unknown[] = []
  for (const [column, value] of Object.entries(columns)) {
    if (value === undefined) continue
    sets.push(`${column} = ?`)
    values.push(value)
  }
  if (!sets.length) return { ok: true }

  sets.push('updated_at = ?')
  values.push(nowIso())
  await db.prepare(`UPDATE businesses SET ${sets.join(', ')} WHERE id = ?`).bind(...values, id).run()

  return { ok: true }
})
