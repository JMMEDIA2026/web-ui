import { z } from 'zod'

const schema = z.object({
  current: z.string().min(1, '현재 비밀번호를 입력하세요').max(200),
  next: z.string().min(10, '새 비밀번호는 10자 이상으로 입력하세요').max(100)
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { current, next } = await parseBody(event, schema)
  const db = useDB(event)

  const row = await db.prepare('SELECT value FROM settings WHERE key = ?').bind('admin_password').first<{ value: string }>()
  if (!row || !(await verifySecret(current, row.value))) {
    throw createError({ statusCode: 400, statusMessage: '현재 비밀번호가 올바르지 않습니다' })
  }

  await db
    .prepare('UPDATE settings SET value = ? WHERE key = ?')
    .bind(await hashSecret(next), 'admin_password')
    .run()

  return { ok: true }
})
