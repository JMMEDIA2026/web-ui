import { z } from 'zod'
import { MAX_BANNER_B64, cleanLink } from '../../../utils/banner'

const date = z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/, '날짜 형식이 올바르지 않습니다')

const schema = z.object({
  title: z.string().trim().min(1).max(80).optional(),
  advertiser: z.string().trim().max(80).optional(),
  linkUrl: z.string().optional(),
  active: z.boolean().optional(),
  startsAt: date.optional(),
  endsAt: date.optional(),
  // 위(-1) 또는 아래(1)로 한 칸 옮기기
  move: z.union([z.literal(-1), z.literal(1)]).optional(),
  image: z.string().min(1000).max(MAX_BANNER_B64 + 10, '이미지가 너무 큽니다').optional()
})

// 배너 수정·켜기/끄기·순서 변경·이미지 교체 (관리자)
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id') ?? ''
  const body = await parseBody(event, schema)
  const db = useDB(event)

  const cur = await db.prepare('SELECT id, sort_order, starts_at, ends_at FROM banners WHERE id = ?').bind(id).first<{ id: string, sort_order: number, starts_at: string, ends_at: string }>()
  if (!cur) throw createError({ statusCode: 404, statusMessage: '배너를 찾을 수 없습니다' })

  const sets: string[] = []
  const vals: unknown[] = []
  const set = (col: string, v: unknown) => { sets.push(`${col} = ?`); vals.push(v) }

  if (body.title !== undefined) set('title', body.title)
  if (body.advertiser !== undefined) set('advertiser', body.advertiser)
  if (body.linkUrl !== undefined) {
    const link = cleanLink(body.linkUrl)
    if (link === null) throw createError({ statusCode: 400, statusMessage: '이동 주소는 https:// 로 시작하거나 /로 시작하는 사이트 안 경로만 쓸 수 있습니다' })
    set('link_url', link)
  }
  if (body.active !== undefined) set('active', body.active ? 1 : 0)
  const starts = body.startsAt ?? cur.starts_at
  const ends = body.endsAt ?? cur.ends_at
  if (starts && ends && starts > ends) throw createError({ statusCode: 400, statusMessage: '종료일이 시작일보다 빠릅니다' })
  if (body.startsAt !== undefined) set('starts_at', body.startsAt)
  if (body.endsAt !== undefined) set('ends_at', body.endsAt)
  if (body.image !== undefined) {
    const bytes = decodeBase64(body.image)
    const mime = bytes ? sniffImage(bytes) : null
    if (!mime) throw createError({ statusCode: 400, statusMessage: '이미지 파일(JPG·PNG·WebP)만 올릴 수 있습니다' })
    set('image_b64', body.image)
    set('mime', mime)
  }

  // 순서 바꾸기: 바로 위·아래 배너와 자리를 맞바꿉니다.
  if (body.move) {
    const { results } = await db.prepare('SELECT id FROM banners ORDER BY sort_order, created_at').all<{ id: string }>()
    const ids = results.map(r => r.id)
    const i = ids.indexOf(id)
    const j = i + body.move
    if (j >= 0 && j < ids.length) {
      ;[ids[i], ids[j]] = [ids[j]!, ids[i]!]
      for (let k = 0; k < ids.length; k++) {
        await db.prepare('UPDATE banners SET sort_order = ? WHERE id = ?').bind(k, ids[k]).run()
      }
    }
  }

  if (sets.length) {
    set('updated_at', nowIso())
    await db.prepare(`UPDATE banners SET ${sets.join(', ')} WHERE id = ?`).bind(...vals, id).run()
  }
  return { ok: true }
})
