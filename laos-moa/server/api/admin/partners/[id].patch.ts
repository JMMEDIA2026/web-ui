import { z } from 'zod'

const schema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  category: z.enum(PARTNER_CATEGORIES).optional(),
  contact: z.string().trim().max(100).optional(),
  active: z.boolean().optional(),
  resetCode: z.boolean().optional()
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id') ?? ''
  const body = await parseBody(event, schema)
  const db = useDB(event)

  const exists = await db.prepare('SELECT id FROM partners WHERE id = ?').bind(id).first()
  if (!exists) {
    throw createError({ statusCode: 404, statusMessage: '협력업체를 찾을 수 없습니다' })
  }

  const sets: string[] = []
  const values: unknown[] = []
  if (body.name !== undefined) { sets.push('name = ?'); values.push(body.name) }
  if (body.category !== undefined) { sets.push('category = ?'); values.push(body.category) }
  if (body.contact !== undefined) { sets.push('contact = ?'); values.push(body.contact) }
  if (body.active !== undefined) { sets.push('active = ?'); values.push(body.active ? 1 : 0) }

  let code: string | undefined
  if (body.resetCode) {
    code = randomCode(8)
    sets.push('code_hash = ?')
    values.push(await hashSecret(code))
  }

  if (sets.length) {
    await db.prepare(`UPDATE partners SET ${sets.join(', ')} WHERE id = ?`).bind(...values, id).run()
  }

  return { ok: true, code }
})
