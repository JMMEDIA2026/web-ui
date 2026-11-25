import { z } from 'zod'

const RATE_KIND = 'admin-login'

export default defineEventHandler(async (event) => {
  assertSameOrigin(event)
  const { password } = await parseBody(event, z.object({ password: z.string().min(1).max(200) }))
  const db = useDB(event)
  const ip = clientIp(event)

  // 10분 안에 5번 틀리면 잠시 막습니다.
  if (await rateCount(db, ip, RATE_KIND, 10 * 60 * 1000) >= 5) {
    throw createError({ statusCode: 429, statusMessage: '시도가 너무 많습니다. 10분 뒤에 다시 시도해 주세요' })
  }

  const row = await db.prepare('SELECT value FROM settings WHERE key = ?').bind('admin_password').first<{ value: string }>()
  const valid = row ? await verifySecret(password, row.value) : false

  if (!valid) {
    await rateAdd(db, ip, RATE_KIND)
    throw createError({ statusCode: 401, statusMessage: '비밀번호가 올바르지 않습니다' })
  }

  await rateClear(db, ip, RATE_KIND)
  await startSession(event, 'admin')
  return { ok: true }
})
