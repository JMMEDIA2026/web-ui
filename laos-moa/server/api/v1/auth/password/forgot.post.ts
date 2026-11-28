import { z } from 'zod'
import { requireApiClient } from '../../../../utils/apiAuth'
import { RESET_CODE_MINUTES, issueResetCode } from '../../../../utils/passwordReset'

// 비밀번호 찾기 1단계: 가입한 이메일로 재설정 코드(8자)를 보냅니다.
// 이메일이 가입돼 있든 아니든 같은 응답을 돌려줍니다. (가입 여부를 알아내지 못하게)
export default defineEventHandler(async (event) => {
  const client = await requireApiClient(event, 'auth')
  const { email } = await parseBody(event, z.object({ email: z.string().trim().toLowerCase().email('이메일 형식이 올바르지 않아요').max(120) }))
  // 한 키로 1시간에 60번까지
  const db = useDB(event)
  const byClient = `api:${client.id}`
  if (await rateCount(db, byClient, 'api-forgot', 3600 * 1000) >= 60) {
    throw createError({ statusCode: 429, statusMessage: '요청이 너무 많아요. 잠시 후 다시 시도해 주세요' })
  }
  await rateAdd(db, byClient, 'api-forgot')
  await issueResetCode(event, email)
  return { ok: true, message: '가입된 이메일이라면 재설정 코드를 보냈어요. 메일함을 확인해 주세요', expiresInMinutes: RESET_CODE_MINUTES }
})
