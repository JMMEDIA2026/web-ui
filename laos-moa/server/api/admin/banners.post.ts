import { z } from 'zod'
import { MAX_BANNERS, MAX_BANNER_B64, cleanLink } from '../../utils/banner'

const date = z.string().regex(/^(\d{4}-\d{2}-\d{2})?$/, '날짜 형식이 올바르지 않습니다').default('')

const schema = z.object({
  title: z.string().trim().min(1, '배너 이름을 입력하세요').max(80),
  advertiser: z.string().trim().max(80).default(''),
  linkUrl: z.string().default(''),
  startsAt: date,
  endsAt: date,
  image: z.string().min(1000, '이미지 파일이 너무 작거나 깨졌습니다').max(MAX_BANNER_B64 + 10, '이미지가 너무 큽니다')
})

// 배너 등록 (관리자)
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await parseBody(event, schema)
  const db = useDB(event)

  const link = cleanLink(body.linkUrl)
  if (link === null) throw createError({ statusCode: 400, statusMessage: '이동 주소는 https:// 로 시작하거나 /로 시작하는 사이트 안 경로만 쓸 수 있습니다' })
  if (body.startsAt && body.endsAt && body.startsAt > body.endsAt) {
    throw createError({ statusCode: 400, statusMessage: '종료일이 시작일보다 빠릅니다' })
  }

  const bytes = decodeBase64(body.image)
  const mime = bytes ? sniffImage(bytes) : null
  if (!mime) throw createError({ statusCode: 400, statusMessage: '이미지 파일(JPG·PNG·WebP)만 올릴 수 있습니다' })

  const count = await db.prepare('SELECT COUNT(*) AS n, COALESCE(MAX(sort_order), -1) AS m FROM banners').first<{ n: number, m: number }>()
  if ((count?.n ?? 0) >= MAX_BANNERS) {
    throw createError({ statusCode: 400, statusMessage: `배너는 ${MAX_BANNERS}개까지 등록할 수 있습니다. 끝난 배너를 지워 주세요` })
  }

  const id = `B${randomCode(8)}`
  const now = nowIso()
  await db
    .prepare('INSERT INTO banners (id, title, advertiser, link_url, image_b64, mime, active, sort_order, starts_at, ends_at, clicks, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?, 0, ?, ?)')
    .bind(id, body.title, body.advertiser, link, body.image, mime, (count?.m ?? -1) + 1, body.startsAt, body.endsAt, now, now)
    .run()
  return { ok: true, id }
})
