import { z } from 'zod'
import { notMembersOnlySql } from '../../../utils/memberOnly'
import { rawCategoriesFor } from '../../../../shared/utils/category'
import { BUSINESS_SELECT } from '../../../utils/constants'
import { toPublicBusiness } from '../../../utils/business'
import { pageParams, requireApiClient } from '../../../utils/apiAuth'

// 업체 목록. 사진은 id만 주고, 이미지는 https://laja.joybox.day/api/photos/<id> 로 불러옵니다.
export default defineEventHandler(async (event) => {
  await requireApiClient(event, 'businesses:read')
  const { limit, offset } = pageParams(event)
  const q = z.object({ category: z.string().max(30).optional(), includeInactive: z.enum(['1', '0']).optional() }).parse(getQuery(event))
  const db = useDB(event)
  const raws = q.category ? rawCategoriesFor(q.category) : []
  const where = `(? = 0 OR b.category IN (${raws.map(() => '?').join(',') || "''"})) AND (? = '1' OR b.active = 1) AND ${notMembersOnlySql('b')}`
  const binds = [raws.length ? 1 : 0, ...raws, q.includeInactive ?? '0']
  const total = await db.prepare(`SELECT COUNT(*) AS n FROM businesses b WHERE ${where}`).bind(...binds).first<{ n: number }>()
  const { results } = await db
    .prepare(
      `SELECT ${BUSINESS_SELECT}, b.active
       FROM businesses b LEFT JOIN partners p ON p.id = b.partner_id AND p.active = 1
       WHERE ${where} ORDER BY b.sponsored DESC, b.created_at DESC, b.id LIMIT ? OFFSET ?`
    )
    .bind(...binds, limit, offset)
    .all<Record<string, unknown>>()
  return { total: total?.n ?? 0, limit, offset, items: results.map(r => ({ ...toPublicBusiness(r), active: r.active === 1 })) }
})
