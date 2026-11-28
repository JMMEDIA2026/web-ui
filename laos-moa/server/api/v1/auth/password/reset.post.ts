import { z } from 'zod'
import { requireApiClient } from '../../../../utils/apiAuth'
import { applyResetCode } from '../../../../utils/passwordReset'

// 비밀번호 찾기 2단계: 이메일로 받은 코드와 새 비밀번호를 보내면 비밀번호를 바꿉니다.
export default defineEventHandler(async (event) => {
  await requireApiClient(event, 'auth')
  const { email, code, newPassword } = await parseBody(event, z.object({
    email: z.string().trim().toLowerCase().email('이메일 형식이 올바르지 않아요').max(120),
    code: z.string().max(20),
    newPassword: z.string().max(200)
  }))
  await applyResetCode(event, email, code, newPassword)
  return { ok: true, message: '비밀번호를 바꿨어요. 새 비밀번호로 로그인해 주세요' }
})
