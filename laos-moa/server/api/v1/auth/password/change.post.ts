import { z } from 'zod'
import { hashSecret, verifySecret } from '../../../../utils/auth'
import { requireApiClient, requireApiMember } from '../../../../utils/apiAuth'
import { passwordSchema } from '../../../../utils/memberAuth'

// 로그인한 회원이 현재 비밀번호를 확인하고 새 비밀번호로 바꿉니다. (+ X-Member-Token)
export default defineEventHandler(async (event) => {
  const client = await requireApiClient(event, 'auth')
  const member = await requireApiMember(event, client)
  const { currentPassword, newPassword } = await parseBody(event, z.object({
    currentPassword: z.string().min(1, '현재 비밀번호를 입력해 주세요').max(200),
    newPassword: passwordSchema
  }))
  const db = useDB(event)

  const who = `m:${member.id}`
  if (await rateCount(db, who, 'api-pwchange', 10 * 60 * 1000) >= 5) {
    throw createError({ statusCode: 429, statusMessage: '시도가 너무 많아요. 잠시 후 다시 시도해 주세요' })
  }
  const row = await db.prepare('SELECT password_hash FROM members WHERE id = ?').bind(member.id).first<{ password_hash: string }>()
  if (!row || !await verifySecret(currentPassword, row.password_hash)) {
    await rateAdd(db, who, 'api-pwchange')
    throw createError({ statusCode: 400, statusMessage: '현재 비밀번호가 맞지 않아요' })
  }
  await db.prepare('UPDATE members SET password_hash = ? WHERE id = ?').bind(await hashSecret(newPassword), member.id).run()
  await db.prepare('UPDATE password_resets SET used = 1 WHERE member_id = ?').bind(member.id).run()
  return { ok: true, message: '비밀번호를 바꿨어요' }
})
