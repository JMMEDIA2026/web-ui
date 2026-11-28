import { createMember, signupSchema } from '../../utils/memberAuth'
import { z } from 'zod'

const RATE_KIND = 'member-signup'

const bodySchema = signupSchema.extend({
  website: z.string().optional() // 스팸 방지용 숨김 필드
})

export default defineEventHandler(async (event) => {
  assertSameOrigin(event)
  const data = await parseBody(event, bodySchema)

  // 숨김 필드가 채워져 있으면 봇으로 보고 조용히 성공 처리합니다.
  if (data.website) return { ok: true }

  const db = useDB(event)
  const ip = clientIp(event)

  // 같은 곳에서 1시간에 5번까지만 가입할 수 있어요.
  if (await rateCount(db, ip, RATE_KIND, 3600 * 1000) >= 5) {
    throw createError({ statusCode: 429, statusMessage: '가입 시도가 너무 많아요. 잠시 후 다시 시도해 주세요' })
  }

  const id = await createMember(event, data)
  await rateAdd(db, ip, RATE_KIND)

  await startMemberSession(event, id)
  return { ok: true }
})
