import { z } from 'zod'

const RATE_KIND = 'member-login'

export default defineEventHandler(async (event) => {
  assertSameOrigin(event)
  const { email, password } = await parseBody(event, z.object({
    email: z.string().trim().toLowerCase().min(1, '이메일을 입력해 주세요').max(120),
    password: z.string().min(1, '비밀번호를 입력해 주세요').max(200)
  }))
  const db = useDB(event)
  const ip = clientIp(event)

  // 10분 안에 8번 틀리면 잠시 막습니다.
  if (await rateCount(db, ip, RATE_KIND, 10 * 60 * 1000) >= 8) {
    throw createError({ statusCode: 429, statusMessage: '시도가 너무 많아요. 10분 뒤에 다시 시도해 주세요' })
  }

  const row = await db
    .prepare('SELECT id, password_hash FROM members WHERE email = ?')
    .bind(email)
    .first<{ id: string, password_hash: string }>()
  const valid = row ? await verifySecret(password, row.password_hash) : false

  if (!row || !valid) {
    await rateAdd(db, ip, RATE_KIND)
    // 이메일이 있는지 없는지 알려 주지 않습니다.
    throw createError({ statusCode: 401, statusMessage: '이메일 또는 비밀번호가 맞지 않아요' })
  }

  await rateClear(db, ip, RATE_KIND)
  await db.prepare('UPDATE members SET last_login_at = ? WHERE id = ?').bind(nowIso(), row.id).run()
  await startMemberSession(event, row.id)
  return { ok: true }
})
