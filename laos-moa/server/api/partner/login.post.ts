import { z } from 'zod'

const RATE_KIND = 'partner-login'

const schema = z.object({
  id: z.string().trim().toLowerCase().min(1, '로그인 ID를 입력하세요').max(40),
  code: z.string().trim().toUpperCase().min(1, '접속 코드를 입력하세요').max(40)
})

export default defineEventHandler(async (event) => {
  assertSameOrigin(event)
  const { id, code } = await parseBody(event, schema)
  const db = useDB(event)
  const ip = clientIp(event)

  if (await rateCount(db, ip, RATE_KIND, 10 * 60 * 1000) >= 8) {
    throw createError({ statusCode: 429, statusMessage: '시도가 너무 많습니다. 10분 뒤에 다시 시도해 주세요' })
  }

  const partner = await db
    .prepare('SELECT id, code_hash, active FROM partners WHERE id = ?')
    .bind(id)
    .first<{ id: string, code_hash: string, active: number }>()

  // ID가 없어도 같은 시간이 걸리도록 항상 해시 검증을 합니다.
  const valid = await verifySecret(code, partner?.code_hash ?? 'pbkdf2$100000$00$00')
  if (!partner || !partner.active || !valid) {
    await rateAdd(db, ip, RATE_KIND)
    throw createError({ statusCode: 401, statusMessage: '로그인 ID 또는 접속 코드가 올바르지 않습니다' })
  }

  await rateClear(db, ip, RATE_KIND)
  await startSession(event, 'partner', partner.id)
  return { ok: true }
})
