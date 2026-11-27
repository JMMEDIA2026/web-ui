import { z } from 'zod'
import { hashSecret, sha256Hex } from '../../../../utils/auth'
import { requireApiClient } from '../../../../utils/apiAuth'
import { passwordSchema } from '../../../../utils/memberAuth'

const RATE_KIND = 'api-reset'
const BAD = '코드가 맞지 않거나 만료됐어요. 코드를 다시 받아 주세요'

// 비밀번호 찾기 2단계: 이메일로 받은 코드와 새 비밀번호를 보내면 비밀번호를 바꿉니다.
export default defineEventHandler(async (event) => {
  await requireApiClient(event, 'auth')
  const { email, code, newPassword } = await parseBody(event, z.object({
    email: z.string().trim().toLowerCase().email('이메일 형식이 올바르지 않아요').max(120),
    code: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{8}$/, '코드는 8자리예요'),
    newPassword: passwordSchema
  }))
  const db = useDB(event)

  const who = `email:${email}`
  if (await rateCount(db, who, RATE_KIND, 10 * 60 * 1000) >= 10) {
    throw createError({ statusCode: 429, statusMessage: '시도가 너무 많아요. 잠시 후 다시 시도해 주세요' })
  }
  await rateAdd(db, who, RATE_KIND)

  const member = await db.prepare('SELECT id FROM members WHERE email = ?').bind(email).first<{ id: string }>()
  const row = member
    ? await db
      .prepare('SELECT id, code_hash, attempts FROM password_resets WHERE member_id = ? AND used = 0 AND expires_at > ? ORDER BY created_at DESC LIMIT 1')
      .bind(member.id, Date.now())
      .first<{ id: string, code_hash: string, attempts: number }>()
    : null
  if (!member || !row || row.attempts >= 5) throw createError({ statusCode: 400, statusMessage: BAD })

  if (await sha256Hex(`${member.id}:${code}`) !== row.code_hash) {
    await db.prepare('UPDATE password_resets SET attempts = attempts + 1 WHERE id = ?').bind(row.id).run()
    throw createError({ statusCode: 400, statusMessage: BAD })
  }

  await db.prepare('UPDATE members SET password_hash = ? WHERE id = ?').bind(await hashSecret(newPassword), member.id).run()
  await db.prepare('UPDATE password_resets SET used = 1 WHERE member_id = ?').bind(member.id).run()
  await rateClear(db, `email:${email}`, 'api-login')
  return { ok: true, message: '비밀번호를 바꿨어요. 새 비밀번호로 로그인해 주세요' }
})
