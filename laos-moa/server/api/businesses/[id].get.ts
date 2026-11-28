import { notMembersOnlySql } from '../../utils/memberOnly'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id') ?? ''

  const row = await useDB(event)
    .prepare(
      `SELECT ${BUSINESS_SELECT}
       FROM businesses b
       LEFT JOIN partners p ON p.id = b.partner_id AND p.active = 1
       WHERE b.id = ? AND b.active = 1 AND ${notMembersOnlySql('b')}`
    )
    .bind(id)
    .first()

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: '업체를 찾을 수 없어요' })
  }
  return toPublicBusiness(row)
})
