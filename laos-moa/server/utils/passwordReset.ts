import type { H3Event } from 'h3'
import { hashSecret, sha256Hex } from './auth'
import { mailConfigured, sendMail } from './mail'
import { passwordSchema } from './memberAuth'

export const RESET_CODE_MINUTES = 30
const FORGOT_KIND = 'api-forgot'
const RESET_KIND = 'api-reset'
const BAD_CODE = '코드가 맞지 않거나 만료됐어요. 코드를 다시 받아 주세요'

// 사이트와 외부 API가 함께 쓰는 비밀번호 찾기 로직.
// 1단계: 가입한 이메일로 재설정 코드(8자)를 보냅니다. 가입 여부는 알려 주지 않습니다.
export async function issueResetCode(event: H3Event, email: string): Promise<void> {
  if (!mailConfigured(event)) {
    throw createError({ statusCode: 503, statusMessage: '이메일 발송이 아직 설정되지 않았어요. 라자 관리자에게 문의해 주세요' })
  }
  const db = useDB(event)
  // 같은 이메일로 1시간에 3번까지 (사이트·API 합산)
  const who = `email:${email}`
  if (await rateCount(db, who, FORGOT_KIND, 3600 * 1000) >= 3) {
    throw createError({ statusCode: 429, statusMessage: '요청이 너무 많아요. 잠시 후 다시 시도해 주세요' })
  }
  await rateAdd(db, who, FORGOT_KIND)

  const member = await db.prepare('SELECT id FROM members WHERE email = ?').bind(email).first<{ id: string }>()
  if (!member) return
  const code = randomCode(8)
  // 이전 코드는 모두 폐기하고 새 코드를 만듭니다.
  await db.prepare('UPDATE password_resets SET used = 1 WHERE member_id = ?').bind(member.id).run()
  await db
    .prepare('INSERT INTO password_resets (id, member_id, code_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind(`PR${randomCode(10)}`, member.id, await sha256Hex(`${member.id}:${code}`), Date.now() + RESET_CODE_MINUTES * 60 * 1000, nowIso())
    .run()
  await sendMail(
    event,
    email,
    '[라자] 비밀번호 재설정 코드',
    `비밀번호 재설정 코드: ${code}\n\n${RESET_CODE_MINUTES}분 안에 입력해 주세요. 한 번만 쓸 수 있어요.\n본인이 요청하지 않았다면 이 메일은 무시하셔도 됩니다. 비밀번호는 바뀌지 않아요.`
  )
}

// 2단계: 메일로 받은 코드와 새 비밀번호로 비밀번호를 바꿉니다.
export async function applyResetCode(event: H3Event, email: string, rawCode: string, newPassword: string): Promise<void> {
  const parsedPw = passwordSchema.safeParse(newPassword)
  if (!parsedPw.success) throw createError({ statusCode: 400, statusMessage: parsedPw.error.issues[0]?.message || '비밀번호를 다시 확인해 주세요' })
  const code = rawCode.trim().toUpperCase()
  if (!/^[A-Z0-9]{8}$/.test(code)) throw createError({ statusCode: 400, statusMessage: '코드는 8자리예요' })

  const db = useDB(event)
  const who = `email:${email}`
  if (await rateCount(db, who, RESET_KIND, 10 * 60 * 1000) >= 10) {
    throw createError({ statusCode: 429, statusMessage: '시도가 너무 많아요. 잠시 후 다시 시도해 주세요' })
  }
  await rateAdd(db, who, RESET_KIND)

  const member = await db.prepare('SELECT id FROM members WHERE email = ?').bind(email).first<{ id: string }>()
  const row = member
    ? await db
      .prepare('SELECT id, code_hash, attempts FROM password_resets WHERE member_id = ? AND used = 0 AND expires_at > ? ORDER BY created_at DESC LIMIT 1')
      .bind(member.id, Date.now())
      .first<{ id: string, code_hash: string, attempts: number }>()
    : null
  if (!member || !row || row.attempts >= 5) throw createError({ statusCode: 400, statusMessage: BAD_CODE })

  if (await sha256Hex(`${member.id}:${code}`) !== row.code_hash) {
    await db.prepare('UPDATE password_resets SET attempts = attempts + 1 WHERE id = ?').bind(row.id).run()
    throw createError({ statusCode: 400, statusMessage: BAD_CODE })
  }

  await db.prepare('UPDATE members SET password_hash = ? WHERE id = ?').bind(await hashSecret(newPassword), member.id).run()
  await db.prepare('UPDATE password_resets SET used = 1 WHERE member_id = ?').bind(member.id).run()
  await rateClear(db, `email:${email}`, 'api-login')
  await rateClear(db, clientIp(event), 'member-login')
}
