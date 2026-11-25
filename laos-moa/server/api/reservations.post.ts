import { z } from 'zod'

const RATE_KIND = 'reserve'

const schema = z.object({
  partnerId: z.string().trim().min(1, '예약할 업체를 선택하세요').max(40),
  name: z.string().trim().min(1, '이름을 입력하세요').max(50),
  contact: z.string().trim().min(2, '연락처를 입력하세요').max(100),
  service: z.string().trim().max(100).default(''),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜를 선택하세요'),
  people: z.coerce.number().int().min(1, '인원을 확인하세요').max(100, '인원을 확인하세요'),
  note: z.string().trim().max(1000).default(''),
  website: z.string().optional() // 스팸 방지용 숨김 필드
})

export default defineEventHandler(async (event) => {
  assertSameOrigin(event)
  const body = await parseBody(event, schema)

  // 숨김 필드가 채워져 있으면 봇으로 보고 조용히 성공 처리합니다.
  if (body.website) {
    return { ok: true, code: 'R-------' }
  }

  // 라오스 시간(UTC+7) 기준으로 어제보다 이전 날짜는 받지 않습니다.
  const laosToday = new Date(Date.now() + 7 * 3600 * 1000)
  laosToday.setUTCDate(laosToday.getUTCDate() - 1)
  if (body.date < laosToday.toISOString().slice(0, 10)) {
    throw createError({ statusCode: 400, statusMessage: '지난 날짜는 예약할 수 없습니다' })
  }

  const db = useDB(event)
  const ip = clientIp(event)

  // 같은 곳에서 1시간에 10건까지만 받습니다.
  if (await rateCount(db, ip, RATE_KIND, 3600 * 1000) >= 10) {
    throw createError({ statusCode: 429, statusMessage: '예약 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요' })
  }

  const partner = await db
    .prepare('SELECT id, name FROM partners WHERE id = ? AND active = 1')
    .bind(body.partnerId)
    .first<{ id: string, name: string }>()
  if (!partner) {
    throw createError({ statusCode: 404, statusMessage: '예약할 수 없는 업체입니다' })
  }

  const code = `R${randomCode(6)}`
  const now = nowIso()
  await db
    .prepare(
      `INSERT INTO reservations
        (id, partner_id, customer_name, customer_contact, service, reserve_date, people, note, status, partner_memo, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', '', ?, ?)`
    )
    .bind(code, partner.id, body.name, body.contact, body.service, body.date, body.people, body.note, now, now)
    .run()
  await rateAdd(db, ip, RATE_KIND)

  await notify(
    event,
    [
      `[라오스모아] 새 예약 요청 ${code}`,
      `업체: ${partner.name}`,
      `고객: ${body.name} (${body.contact})`,
      `날짜: ${body.date} / ${body.people}명`,
      body.service ? `서비스: ${body.service}` : ''
    ].filter(Boolean).join('\n')
  )

  return { ok: true, code }
})
