import { z } from 'zod'
import { sha256Hex } from '../../../../utils/auth'
import { requireApiClient } from '../../../../utils/apiAuth'
import { mailConfigured, sendMail } from '../../../../utils/mail'

const RATE_KIND = 'api-forgot'
const CODE_MINUTES = 30

// 비밀번호 찾기 1단계: 가입한 이메일로 재설정 코드(8자)를 보냅니다.
// 이메일이 가입돼 있든 아니든 같은 응답을 돌려줍니다. (가입 여부를 알아내지 못하게)
export default defineEventHandler(async (event) => {
  const client = await requireApiClient(event, 'auth')
  const { email } = await parseBody(event, z.object({ email: z.string().trim().toLowerCase().email('이메일 형식이 올바르지 않아요').max(120) }))
  if (!mailConfigured(event)) {
    throw createError({ statusCode: 503, statusMessage: '이메일 발송이 아직 설정되지 않았어요. 라자 관리자에게 문의해 주세요' })
  }
  const db = useDB(event)

  // 같은 이메일로 1시간에 3번, 한 키로 1시간에 60번까지
  const byEmail = `email:${email}`
  const byClient = `api:${client.id}`
  if (await rateCount(db, byEmail, RATE_KIND, 3600 * 1000) >= 3 || await rateCount(db, byClient, RATE_KIND, 3600 * 1000) >= 60) {
    throw createError({ statusCode: 429, statusMessage: '요청이 너무 많아요. 잠시 후 다시 시도해 주세요' })
  }
  await rateAdd(db, byEmail, RATE_KIND)
  await rateAdd(db, byClient, RATE_KIND)

  const member = await db.prepare('SELECT id FROM members WHERE email = ?').bind(email).first<{ id: string }>()
  if (member) {
    const code = randomCode(8)
    // 이전 코드는 모두 폐기하고 새 코드를 만듭니다.
    await db.prepare('UPDATE password_resets SET used = 1 WHERE member_id = ?').bind(member.id).run()
    await db
      .prepare('INSERT INTO password_resets (id, member_id, code_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?)')
      .bind(`PR${randomCode(10)}`, member.id, await sha256Hex(`${member.id}:${code}`), Date.now() + CODE_MINUTES * 60 * 1000, nowIso())
      .run()
    await sendMail(
      event,
      email,
      '[라자] 비밀번호 재설정 코드',
      `비밀번호 재설정 코드: ${code}\n\n${CODE_MINUTES}분 안에 입력해 주세요. 한 번만 쓸 수 있어요.\n본인이 요청하지 않았다면 이 메일은 무시하셔도 됩니다. 비밀번호는 바뀌지 않아요.`
    )
  }
  return { ok: true, message: '가입된 이메일이라면 재설정 코드를 보냈어요. 메일함을 확인해 주세요', expiresInMinutes: CODE_MINUTES }
})
