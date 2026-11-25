import { z } from 'zod'

const schema = z.object({
  full: z.string().min(1000, '사진 파일이 너무 작거나 깨졌습니다').max(MAX_FULL_B64 + 10, '사진이 너무 큽니다'),
  thumb: z.string().min(400, '사진 파일이 너무 작거나 깨졌습니다').max(MAX_THUMB_B64 + 10, '작은 사진이 너무 큽니다')
})

// 업체 사진 올리기 (관리자). 브라우저에서 줄인 큰 사진과 작은 사진을 함께 받습니다.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id') ?? ''
  const body = await parseBody(event, schema)
  const db = useDB(event)

  const biz = await db.prepare('SELECT id FROM businesses WHERE id = ?').bind(id).first()
  if (!biz) throw createError({ statusCode: 404, statusMessage: '업체를 찾을 수 없습니다' })

  const full = decodeBase64(body.full)
  const thumb = decodeBase64(body.thumb)
  const mime = full ? sniffImage(full) : null
  const thumbMime = thumb ? sniffImage(thumb) : null
  if (!mime || !thumbMime) {
    throw createError({ statusCode: 400, statusMessage: '이미지 파일(JPG·PNG·WebP)만 올릴 수 있습니다' })
  }
  if (mime !== thumbMime) {
    throw createError({ statusCode: 400, statusMessage: '사진 형식이 서로 맞지 않습니다' })
  }

  const count = await db.prepare('SELECT COUNT(*) AS n FROM business_photos WHERE business_id = ?').bind(id).first<{ n: number }>()
  if ((count?.n ?? 0) >= MAX_PHOTOS_PER_BUSINESS) {
    throw createError({ statusCode: 400, statusMessage: `사진은 업체마다 ${MAX_PHOTOS_PER_BUSINESS}장까지 올릴 수 있습니다` })
  }

  const photoId = `P${randomCode(10)}`
  const first = (count?.n ?? 0) === 0
  await db
    .prepare('INSERT INTO business_photos (id, business_id, full_b64, thumb_b64, mime, is_cover, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(photoId, id, body.full, body.thumb, mime, first ? 1 : 0, count?.n ?? 0, nowIso())
    .run()
  await db.prepare('UPDATE businesses SET updated_at = ? WHERE id = ?').bind(nowIso(), id).run()

  return { ok: true, id: photoId, cover: first }
})
