import { checkLogin, loginSchema } from '../../utils/memberAuth'

const RATE_KIND = 'member-login'

export default defineEventHandler(async (event) => {
  assertSameOrigin(event)
  const { email, password } = await parseBody(event, loginSchema)
  const db = useDB(event)
  const ip = clientIp(event)

  // 10분 안에 8번 틀리면 잠시 막습니다.
  if (await rateCount(db, ip, RATE_KIND, 10 * 60 * 1000) >= 8) {
    throw createError({ statusCode: 429, statusMessage: '시도가 너무 많아요. 10분 뒤에 다시 시도해 주세요' })
  }

  const memberId = await checkLogin(event, email, password)
  if (!memberId) {
    await rateAdd(db, ip, RATE_KIND)
    // 이메일이 있는지 없는지 알려 주지 않습니다.
    throw createError({ statusCode: 401, statusMessage: '이메일 또는 비밀번호가 맞지 않아요. 다시 확인해 주세요' })
  }

  await rateClear(db, ip, RATE_KIND)
  await startMemberSession(event, memberId)
  return { ok: true }
})
