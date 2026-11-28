import { z } from 'zod'
import { INQUIRY_STATUSES } from '../../../utils/constants'
import { inquiryView } from '../../../utils/apiViews'
import { pageParams, requireApiClient } from '../../../utils/apiAuth'

export default defineEventHandler(async (event) => {
  await requireApiClient(event, 'inquiries:read')
  const { limit, offset } = pageParams(event)
  const q = z.object({ status: z.enum(INQUIRY_STATUSES).optional(), memberId: z.string().max(30).optional(), since: z.string().max(40).optional() }).parse(getQuery(event))
  const db = useDB(event)
  const where = `(? = '' OR status = ?) AND (? = '' OR member_id = ?) AND (? = '' OR created_at >= ?)`
  const binds = [q.status ?? '', q.status ?? '', q.memberId ?? '', q.memberId ?? '', q.since ?? '', q.since ?? '']
  const total = await db.prepare(`SELECT COUNT(*) AS n FROM inquiries WHERE ${where}`).bind(...binds).first<{ n: number }>()
  const { results } = await db
    .prepare(`SELECT * FROM inquiries WHERE ${where} ORDER BY created_at DESC, id LIMIT ? OFFSET ?`)
    .bind(...binds, limit, offset)
    .all<Record<string, unknown>>()
  return { total: total?.n ?? 0, limit, offset, items: results.map(inquiryView) }
})
