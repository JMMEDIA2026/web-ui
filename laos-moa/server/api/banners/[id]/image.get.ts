import { LIVE_BANNER_SQL, laosToday } from '../../../utils/banner'

// 배너 이미지. 노출 중인 배너만 공개합니다.
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') ?? ''
  const row = await useDB(event)
    .prepare(`SELECT b.image_b64, b.mime FROM banners b WHERE b.id = ?2 AND ${LIVE_BANNER_SQL}`)
    .bind(laosToday(), id)
    .first<{ image_b64: string, mime: string }>()
  if (!row) throw createError({ statusCode: 404, statusMessage: '배너를 찾을 수 없습니다' })

  const bytes = decodeBase64(row.image_b64)
  if (!bytes) throw createError({ statusCode: 404, statusMessage: '배너를 찾을 수 없습니다' })

  // 주소 뒤의 v 값이 이미지마다 달라지므로 브라우저가 오래 기억해도 됩니다.
  return new Response(bytes, {
    headers: {
      'content-type': row.mime,
      'cache-control': getQuery(event).v ? 'public, max-age=31536000, immutable' : 'public, max-age=60',
      'x-content-type-options': 'nosniff'
    }
  })
})
