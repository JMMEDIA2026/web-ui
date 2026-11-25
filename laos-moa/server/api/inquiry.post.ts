import { z } from 'zod'

const bodySchema = z.object({
  company: z.string().min(1).max(100),
  contact: z.string().min(2).max(100),
  product: z.enum(['free', 'premium', 'banner', 'etc']),
  message: z.string().max(2000).optional(),
  website: z.string().optional()
})

const productLabel: Record<string, string> = {
  free: '무료 업체 등록',
  premium: '프리미엄 업체',
  banner: '배너 광고',
  etc: '제휴·기타'
}

export default defineEventHandler(async (event) => {
  const result = bodySchema.safeParse(await readBody(event))

  if (!result.success) {
    throw createError({ statusCode: 400, statusMessage: '입력값이 올바르지 않습니다' })
  }

  const data = result.data

  // 숨김 필드가 채워져 있으면 봇으로 보고 조용히 성공 처리합니다.
  if (data.website) {
    return { ok: true }
  }

  const text = [
    '[라오스모아] 새 광고·제휴 문의',
    `업체명: ${data.company}`,
    `연락처: ${data.contact}`,
    `종류: ${productLabel[data.product]}`,
    `내용: ${data.message || '(없음)'}`
  ].join('\n')

  // 환경변수 NUXT_INQUIRY_WEBHOOK_URL 에 슬랙 등 웹훅 주소를 넣으면 알림으로 전달됩니다.
  // 설정하지 않으면 서버 로그에만 남습니다.
  const webhook = useRuntimeConfig(event).inquiryWebhookUrl
  if (webhook) {
    try {
      await $fetch(webhook, { method: 'POST', body: { text } })
    } catch (error) {
      console.error('[inquiry] webhook failed', error)
    }
  } else {
    console.log(text)
  }

  return { ok: true }
})
