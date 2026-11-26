import { z } from 'zod'
import { isValidContactString } from '../../../shared/utils/contact'

const optionalText = (max: number) => z.string().trim().max(max).default('')

const businessFields = {
  name: z.string().trim().min(1, '업체명을 입력하세요').max(80),
  category: z.enum(BUSINESS_CATEGORIES, { message: '분야를 선택하세요' }),
  area: optionalText(60),
  address: optionalText(200),
  lat: z.number().min(-90).max(90).nullable().optional(),
  lng: z.number().min(-180).max(180).nullable().optional(),
  description: optionalText(500),
  hours: optionalText(200),
  contact: z.string().trim().max(900).refine(isValidContactString, '연락처 형식을 확인하세요').default(''),
  mapUrl: z
    .string()
    .trim()
    .max(500)
    .refine(v => v === '' || /^https:\/\//.test(v), '지도 주소는 https:// 로 시작해야 합니다')
    .default('')
}

const schema = z.object({
  id: z.string().regex(/^[a-z0-9][a-z0-9-]{2,39}$/, '주소용 ID는 영문 소문자·숫자·하이픈 3~40자로 입력하세요'),
  ...businessFields,
  sponsored: z.boolean().default(false)
}).refine(v => (v.lat == null) === (v.lng == null), { message: '위도와 경도는 함께 입력하세요' })

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await parseBody(event, schema)
  const db = useDB(event)

  if (await db.prepare('SELECT id FROM businesses WHERE id = ?').bind(body.id).first()) {
    throw createError({ statusCode: 409, statusMessage: '이미 사용 중인 주소용 ID입니다' })
  }

  const now = nowIso()
  await db
    .prepare(
      `INSERT INTO businesses
        (id, name, category, area, address, lat, lng, description, hours, contact, map_url, partner_id, sponsored, active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, 1, ?, ?)`
    )
    .bind(
      body.id, body.name, body.category, body.area, body.address,
      body.lat ?? null, body.lng ?? null, body.description, body.hours, body.contact, body.mapUrl,
      body.sponsored ? 1 : 0, now, now
    )
    .run()

  return { ok: true, id: body.id }
})
