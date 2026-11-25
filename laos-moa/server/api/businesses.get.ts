// 사이트에 노출 중인 업체 목록. 예약을 받을 수 있는(활성 협력업체와 연결된) 업체는 partner_id가 채워집니다.
export default defineEventHandler(async (event) => {
  const { results } = await useDB(event)
    .prepare(
      `SELECT ${BUSINESS_SELECT}
       FROM businesses b
       LEFT JOIN partners p ON p.id = b.partner_id AND p.active = 1
       WHERE b.active = 1
       ORDER BY b.sponsored DESC, b.created_at DESC`
    )
    .all()

  return results.map(toPublicBusiness)
})
