import { z } from 'zod'

const schema = z.object({
  id: z.string().regex(/^[a-z0-9][a-z0-9-]{2,29}$/, '로그인 ID는 영문 소문자·숫자·하이픈 3~30자로 입력하세요'),
  name: z.string().trim().min(1, '업체명을 입력하세요').max(60, '업체명이 너무 깁니다'),
  category: z.enum(PARTNER_CATEGORIES, { message: '분야를 선택하세요' }),
  contact: z.string().trim().max(100).default('')
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await parseBody(event, schema)
  const db = useDB(event)

  const exists = await db.prepare('SELECT id FROM partners WHERE id = ?').bind(body.id).first()
  if (exists) {
    throw createError({ statusCode: 409, statusMessage: '이미 사용 중인 로그인 ID입니다' })
  }

  // 접속 코드는 지금 한 번만 보여 주고, DB에는 해시만 저장합니다.
  const code = randomCode(8)
  await db
    .prepare('INSERT INTO partners (id, name, category, contact, code_hash, active, created_at) VALUES (?, ?, ?, ?, ?, 1, ?)')
    .bind(body.id, body.name, body.category, body.contact, await hashSecret(code), nowIso())
    .run()

  return { id: body.id, code }
})
