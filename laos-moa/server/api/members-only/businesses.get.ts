import { BUSINESS_SELECT, MEMBERS_CATEGORY } from '../../utils/constants'
import { toPublicBusiness } from '../../utils/business'
import { requireMemberAccess } from '../../utils/memberOnly'

// 회원전용 업체 목록. 로그인한 회원(과 관리자)만 볼 수 있어요. 어디에도 저장(캐시)되지 않습니다.
export default defineEventHandler(async (event) => {
  await requireMemberAccess(event)
  setResponseHeader(event, 'cache-control', 'private, no-store')
  const { results } = await useDB(event)
    .prepare(
      `SELECT ${BUSINESS_SELECT}
       FROM businesses b
       LEFT JOIN partners p ON p.id = b.partner_id AND p.active = 1
       WHERE b.active = 1 AND b.category = ?
       ORDER BY b.sponsored DESC, b.created_at DESC`
    )
    .bind(MEMBERS_CATEGORY)
    .all<Record<string, unknown>>()
  return results.map(toPublicBusiness)
})
