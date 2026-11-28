import { z } from 'zod'
import { applyResetCode } from '../../utils/passwordReset'

// 비밀번호 찾기 2단계 (사이트): 메일로 받은 코드와 새 비밀번호로 비밀번호를 바꿉니다.
export default defineEventHandler(async (event) => {
  assertSameOrigin(event)
  const { email, code, newPassword } = await parseBody(event, z.object({
    email: z.string().trim().toLowerCase().email('이메일 형식이 올바르지 않아요').max(120),
    code: z.string().max(20),
    newPassword: z.string().max(200)
  }))
  const db = useDB(event)
  const ip = clientIp(event)
  if (await rateCount(db, ip, 'site-reset', 10 * 60 * 1000) >= 20) {
    throw createError({ statusCode: 429, statusMessage: '시도가 너무 많아요. 잠시 후 다시 시도해 주세요' })
  }
  await rateAdd(db, ip, 'site-reset')
  await applyResetCode(event, email, code, newPassword)
  return { ok: true, message: '비밀번호를 바꿨어요. 새 비밀번호로 로그인해 주세요' }
})
