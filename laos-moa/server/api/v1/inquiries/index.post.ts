import { z } from 'zod'
import { requireApiClient, requireApiMember } from '../../../utils/apiAuth'

const schema = z.object({
  company: z.string().trim().min(1, '업체명을 입력해 주세요').max(100),
  contact: z.string().trim().min(2, '연락처를 입력해 주세요').max(100),
  product: z.enum(['free', 'premium', 'banner', 'correction', 'etc'], { message: '문의 종류를 골라 주세요' }),
  message: z.string().trim().max(2000).default('')
})

// 로그인한 회원의 이름으로 광고·제휴·정보 수정 문의를 남깁니다.
export default defineEventHandler(async (event) => {
  const client = await requireApiClient(event, 'inquiries:write')
  const member = await requireApiMember(event, client)
  const data = await parseBody(event, schema)
  const db = useDB(event)

  const who = `m:${member.id}`
  if (await rateCount(db, who, 'api-inquiry', 3600 * 1000) >= 5) {
    throw createError({ statusCode: 429, statusMessage: '문의가 너무 많아요. 잠시 후 다시 시도해 주세요' })
  }
  const id = `Q${randomCode(6)}`
  await db
    .prepare('INSERT INTO inquiries (id, company, contact, product, message, status, created_at, member_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(id, data.company, data.contact, data.product, data.message, 'new', nowIso(), member.id)
    .run()
  await rateAdd(db, who, 'api-inquiry')
  await notify(event, `[${client.name}] 새 문의 ${id} — ${data.company} (${data.product}) / 회원: ${member.nickname}`)
  setResponseStatus(event, 201)
  return { ok: true, id }
})
