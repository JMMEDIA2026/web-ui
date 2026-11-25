import { z } from 'zod'

const RATE_KIND = 'partner-apply'

const bodySchema = z.object({
  company: z.string().trim().min(1, '업체명을 입력해 주세요').max(100),
  contactName: z.string().trim().min(1, '담당자 이름을 입력해 주세요').max(50),
  contact: z.string().trim().min(2, '연락처를 입력해 주세요').max(100),
  category: z.enum(PARTNER_CATEGORIES, { message: '업종을 골라 주세요' }),
  address: z.string().trim().max(200).default(''),
  message: z.string().trim().max(1500).default(''),
  website: z.string().optional() // 스팸 방지용 숨김 필드
})

// 협력업체 가입 신청: 일반 회원과 별개라서 회원 로그인 없이 보낼 수 있습니다.
// 신청은 관리자 "광고 문의" 목록에 들어오고, 관리자가 확인한 뒤 협력업체 계정을 발급합니다.
export default defineEventHandler(async (event) => {
  assertSameOrigin(event)
  const data = await parseBody(event, bodySchema)

  if (data.website) return { ok: true }

  const db = useDB(event)
  const ip = clientIp(event)
  if (await rateCount(db, ip, RATE_KIND, 3600 * 1000) >= 5) {
    throw createError({ statusCode: 429, statusMessage: '신청이 너무 많아요. 잠시 후 다시 시도해 주세요' })
  }

  const message = [
    `담당자: ${data.contactName}`,
    `업종: ${data.category}`,
    data.address ? `주소: ${data.address}` : '',
    data.message ? `소개: ${data.message}` : ''
  ].filter(Boolean).join('\n')

  await db
    .prepare('INSERT INTO inquiries (id, company, contact, product, message, status, created_at, member_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(`Q${randomCode(6)}`, data.company, data.contact, 'partner', message, 'new', nowIso(), '')
    .run()
  await rateAdd(db, ip, RATE_KIND)

  await notify(event, ['[라자] 협력업체 가입 신청', `업체명: ${data.company}`, `연락처: ${data.contact}`, message].join('\n'))
  return { ok: true }
})
