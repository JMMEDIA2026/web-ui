import { VALID_RESERVATION_SQL, memberGrade } from '../../utils/grade'

// 로그인하지 않았어도 오류 없이 { member: null }을 돌려줍니다.
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'cache-control', 'private, no-store')
  const member = await readMember(event)
  if (!member) return { member: null }

  const db = useDB(event)
  const counts = await db
    .prepare(
      `SELECT (SELECT COUNT(*) FROM reservations r WHERE r.member_id = ? AND ${VALID_RESERVATION_SQL}) AS reservations,
              (SELECT COUNT(*) FROM inquiries WHERE member_id = ?) AS inquiries`
    )
    .bind(member.id, member.id)
    .first<{ reservations: number, inquiries: number }>()

  return {
    member: {
      ...publicMember(member),
      grade: memberGrade({ createdAt: member.created_at, reservations: counts?.reservations ?? 0, inquiries: counts?.inquiries ?? 0 })
    }
  }
})
