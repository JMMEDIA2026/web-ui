import { hasMemberAccess } from '../../utils/memberOnly'
import { MEMBERS_CATEGORY } from '../../utils/constants'

// 업체 사진 보여 주기. 사이트에 보이는(숨기지 않은) 업체의 사진은 누구나 볼 수 있고,
// 숨긴 업체의 사진은 관리자만 볼 수 있습니다. (관리자 화면에서 미리 확인하고 고칠 수 있게)
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') ?? ''
  const size = getQuery(event).size === 'thumb' ? 'thumb' : 'full'

  const row = await useDB(event)
    .prepare(
      `SELECT ph.full_b64, ph.thumb_b64, ph.mime, b.active, b.category
       FROM business_photos ph JOIN businesses b ON b.id = ph.business_id
       WHERE ph.id = ?`
    )
    .bind(id)
    .first<{ full_b64: string, thumb_b64: string, mime: string, active: number, category: string }>()
  // 숨긴 업체는 관리자만, 회원전용 업체는 로그인한 회원(과 관리자)만 볼 수 있습니다.
  const membersOnly = row?.category === MEMBERS_CATEGORY
  const hidden = !!row && (row.active !== 1 || membersOnly)
  const allowed = !row || !hidden || (membersOnly && row.active === 1 ? await hasMemberAccess(event) : await isAdminRequest(event))
  if (!row || !allowed) {
    throw createError({ statusCode: 404, statusMessage: '사진을 찾을 수 없습니다' })
  }

  const bytes = decodeBase64(size === 'thumb' ? row.thumb_b64 : row.full_b64)
  if (!bytes) throw createError({ statusCode: 404, statusMessage: '사진을 찾을 수 없습니다' })

  return new Response(bytes, {
    headers: {
      'content-type': row.mime,
      // 보이는 업체의 사진 주소(id)는 바뀌지 않으므로 오래 기억해도 됩니다. 숨긴 업체의 사진은 저장하지 않습니다.
      'cache-control': hidden ? 'private, no-store' : 'public, max-age=31536000, immutable',
      'x-content-type-options': 'nosniff'
    }
  })
})
