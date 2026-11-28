import { z } from 'zod'
import { notMembersOnlySql } from '../../../utils/memberOnly'
import { requireApiClient, requireApiMember } from '../../../utils/apiAuth'

const schema = z.object({
  businessId: z.string().trim().min(1, '예약할 업체를 골라 주세요').max(60),
  name: z.string().trim().min(1, '이름을 입력해 주세요').max(50),
  contact: z.string().trim().min(2, '연락처를 입력해 주세요').max(100),
  service: z.string().trim().max(100).default(''),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '예약 날짜를 골라 주세요'),
  people: z.coerce.number().int().min(1, '인원은 1~100명으로 입력해 주세요').max(100, '인원은 1~100명으로 입력해 주세요'),
  note: z.string().trim().max(1000).default('')
})

// 로그인한 회원(X-Member-Token)의 이름으로 예약 요청을 만듭니다. 처리는 라자 관리자가 합니다.
export default defineEventHandler(async (event) => {
  const client = await requireApiClient(event, 'reservations:write')
  const member = await requireApiMember(event, client)
  const body = await parseBody(event, schema)

  const laosToday = new Date(Date.now() + 7 * 3600 * 1000)
  laosToday.setUTCDate(laosToday.getUTCDate() - 1)
  if (body.date < laosToday.toISOString().slice(0, 10)) {
    throw createError({ statusCode: 400, statusMessage: '오늘 이후 날짜를 골라 주세요' })
  }

  const db = useDB(event)
  const who = `m:${member.id}`
  if (await rateCount(db, who, 'api-reserve', 3600 * 1000) >= 10) {
    throw createError({ statusCode: 429, statusMessage: '예약 요청이 너무 많아요. 잠시 후 다시 시도해 주세요' })
  }
  const business = await db
    .prepare('SELECT b.id, b.name, p.id AS partner_id FROM businesses b LEFT JOIN partners p ON p.id = b.partner_id AND p.active = 1 WHERE b.id = ? AND b.active = 1 AND ' + notMembersOnlySql('b'))
    .bind(body.businessId)
    .first<{ id: string, name: string, partner_id: string | null }>()
  if (!business) throw createError({ statusCode: 404, statusMessage: '이 업체는 지금 예약을 받지 않아요' })

  const id = `R${randomCode(7)}`
  const now = nowIso()
  await db
    .prepare(
      `INSERT INTO reservations (id, partner_id, customer_name, customer_contact, service, reserve_date, people, note, status, partner_memo, created_at, updated_at, business_id, business_name, member_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', '', ?, ?, ?, ?, ?)`
    )
    .bind(id, business.partner_id ?? '', body.name, body.contact, body.service, body.date, body.people, body.note, now, now, business.id, business.name, member.id)
    .run()
  await rateAdd(db, who, 'api-reserve')
  await notify(event, `[${client.name}] 새 예약 요청 ${id} — ${business.name} / ${body.date} / ${body.people}명`)
  setResponseStatus(event, 201)
  return { ok: true, id }
})
