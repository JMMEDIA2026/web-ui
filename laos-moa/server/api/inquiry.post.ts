import { z } from 'zod'

const RATE_KIND = 'inquiry'

const bodySchema = z.object({
  company: z.string().trim().min(1, '업체명을 입력하세요').max(100),
  contact: z.string().trim().min(2, '연락처를 입력하세요').max(100),
  product: z.enum(['free', 'premium', 'banner', 'etc'], { message: '문의 종류를 선택하세요' }),
  message: z.string().trim().max(2000).optional(),
  website: z.string().optional() // 스팸 방지용 숨김 필드
})

const productLabel: Record<string, string> = {
  free: '무료 업체 등록',
  premium: '프리미엄 업체',
  banner: '배너 광고',
  etc: '제휴·기타'
}

export default defineEventHandler(async (event) => {
  assertSameOrigin(event)
  const data = await parseBody(event, bodySchema)

  // 숨김 필드가 채워져 있으면 봇으로 보고 조용히 성공 처리합니다.
  if (data.website) {
    return { ok: true }
  }

  const db = useDB(event)
  const ip = clientIp(event)

  // 같은 곳에서 1시간에 5건까지만 받습니다.
  if (await rateCount(db, ip, RATE_KIND, 3600 * 1000) >= 5) {
    throw createError({ statusCode: 429, statusMessage: '문의가 너무 많습니다. 잠시 후 다시 시도해 주세요' })
  }

  // 관리자 페이지의 "광고 문의" 목록에서 볼 수 있도록 저장합니다.
  await db
    .prepare('INSERT INTO inquiries (id, company, contact, product, message, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .bind(`Q${randomCode(6)}`, data.company, data.contact, data.product, data.message ?? '', 'new', nowIso())
    .run()
  await rateAdd(db, ip, RATE_KIND)

  await notify(
    event,
    [
      '[라오스모아] 새 광고·제휴 문의',
      `업체명: ${data.company}`,
      `연락처: ${data.contact}`,
      `종류: ${productLabel[data.product]}`,
      `내용: ${data.message || '(없음)'}`
    ].join('\n')
  )

  return { ok: true }
})
