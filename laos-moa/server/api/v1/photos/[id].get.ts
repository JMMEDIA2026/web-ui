import { notMembersOnlySql } from '../../../utils/memberOnly'
import { requireApiClient } from '../../../utils/apiAuth'

// 업체 사진 이미지. ?size=thumb 이면 작은 사진(480px). 사이트에 보이는 업체의 사진만 받을 수 있어요.
// (브라우저의 img 태그는 키 헤더를 보낼 수 없으니, 다른 사이트의 서버가 대신 받아서 전달하세요)
export default defineEventHandler(async (event) => {
  await requireApiClient(event, 'businesses:read')
  const id = getRouterParam(event, 'id') ?? ''
  const size = getQuery(event).size === 'thumb' ? 'thumb' : 'full'
  const row = await useDB(event)
    .prepare(
      `SELECT ph.full_b64, ph.thumb_b64, ph.mime
       FROM business_photos ph JOIN businesses b ON b.id = ph.business_id
       WHERE ph.id = ? AND b.active = 1 AND ${notMembersOnlySql('b')}`
    )
    .bind(id)
    .first<{ full_b64: string, thumb_b64: string, mime: string }>()
  const bytes = row ? decodeBase64(size === 'thumb' ? row.thumb_b64 : row.full_b64) : null
  if (!row || !bytes) throw createError({ statusCode: 404, statusMessage: '사진을 찾을 수 없어요' })
  return new Response(bytes, { headers: { 'content-type': row.mime, 'cache-control': 'private, max-age=3600', 'x-content-type-options': 'nosniff' } })
})
