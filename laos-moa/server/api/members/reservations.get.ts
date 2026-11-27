// 내가 요청한 예약 목록 (최근 순). 로그인한 회원 본인의 예약만 돌려줍니다.
export default defineEventHandler(async (event) => {
  const member = await requireMember(event)
  setResponseHeader(event, 'cache-control', 'private, no-store')

  const { results } = await useDB(event)
    .prepare(
      `SELECT id, business_id, business_name, service, reserve_date, people, note, status, created_at, updated_at
       FROM reservations WHERE member_id = ?
       ORDER BY created_at DESC, id LIMIT 50`
    )
    .bind(member.id)
    .all<Record<string, unknown>>()

  return {
    reservations: results.map(r => ({
      id: String(r.id),
      businessId: String(r.business_id ?? ''),
      businessName: String(r.business_name ?? ''),
      service: String(r.service ?? ''),
      date: String(r.reserve_date),
      people: Number(r.people),
      note: String(r.note ?? ''),
      status: String(r.status),
      createdAt: String(r.created_at),
      updatedAt: String(r.updated_at)
    }))
  }
})
