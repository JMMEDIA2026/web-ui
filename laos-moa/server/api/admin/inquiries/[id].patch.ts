import { z } from 'zod'

const schema = z.object({
  status: z.enum(INQUIRY_STATUSES)
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id') ?? ''
  const { status } = await parseBody(event, schema)

  const result = await useDB(event).prepare('UPDATE inquiries SET status = ? WHERE id = ?').bind(status, id).run()
  if (!result.meta.changes) {
    throw createError({ statusCode: 404, statusMessage: '문의를 찾을 수 없습니다' })
  }
  return { ok: true }
})
