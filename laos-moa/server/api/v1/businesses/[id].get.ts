import { BUSINESS_SELECT } from '../../../utils/constants'
import { toPublicBusiness } from '../../../utils/business'
import { notMembersOnlySql } from '../../../utils/memberOnly'
import { requireApiClient } from '../../../utils/apiAuth'

export default defineEventHandler(async (event) => {
  await requireApiClient(event, 'businesses:read')
  const id = getRouterParam(event, 'id') ?? ''
  const row = await useDB(event)
    .prepare(`SELECT ${BUSINESS_SELECT}, b.active FROM businesses b LEFT JOIN partners p ON p.id = b.partner_id AND p.active = 1 WHERE b.id = ? AND ${notMembersOnlySql('b')}`)
    .bind(id)
    .first<Record<string, unknown>>()
  if (!row) throw createError({ statusCode: 404, statusMessage: '업체를 찾을 수 없어요' })
  return { business: { ...toPublicBusiness(row), active: row.active === 1 } }
})
