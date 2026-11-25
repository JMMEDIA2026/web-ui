// 업체 사진 보여 주기. 사이트에 보이는(숨기지 않은) 업체의 사진만 공개합니다.
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') ?? ''
  const size = getQuery(event).size === 'thumb' ? 'thumb' : 'full'

  const row = await useDB(event)
    .prepare(
      `SELECT ph.full_b64, ph.thumb_b64, ph.mime
       FROM business_photos ph JOIN businesses b ON b.id = ph.business_id
       WHERE ph.id = ? AND b.active = 1`
    )
    .bind(id)
    .first<{ full_b64: string, thumb_b64: string, mime: string }>()
  if (!row) throw createError({ statusCode: 404, statusMessage: '사진을 찾을 수 없습니다' })

  const bytes = decodeBase64(size === 'thumb' ? row.thumb_b64 : row.full_b64)
  if (!bytes) throw createError({ statusCode: 404, statusMessage: '사진을 찾을 수 없습니다' })

  // 사진 주소(id)는 바뀌지 않으므로 브라우저가 오래 기억해도 됩니다.
  return new Response(bytes, {
    headers: {
      'content-type': row.mime,
      'cache-control': 'public, max-age=31536000, immutable',
      'x-content-type-options': 'nosniff'
    }
  })
})
