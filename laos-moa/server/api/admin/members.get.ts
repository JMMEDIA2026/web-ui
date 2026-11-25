import { z } from 'zod'

const query = z.object({
  q: z.string().trim().max(60).optional()
})

// 관리자 전용 회원 목록. 비밀번호 해시는 절대 내려보내지 않습니다.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { q } = query.parse(getQuery(event))
  setResponseHeader(event, 'cache-control', 'no-store')

  // LIKE 의 특수문자(% _)는 글자 그대로 찾습니다.
  const like = q ? `%${q.toLowerCase().replace(/[\\%_]/g, m => `\\${m}`)}%` : ''
  const db = useDB(event)

  const { results } = await db
    .prepare(
      `SELECT m.id, m.nickname, m.real_name, m.email, m.phone, m.gender, m.created_at, m.last_login_at,
              (SELECT COUNT(*) FROM reservations r WHERE r.member_id = m.id) AS reservation_count,
              (SELECT COUNT(*) FROM inquiries i WHERE i.member_id = m.id) AS inquiry_count
       FROM members m
       WHERE (? = '' OR lower(m.nickname) LIKE ? ESCAPE '\\' OR lower(m.email) LIKE ? ESCAPE '\\'
              OR lower(m.real_name) LIKE ? ESCAPE '\\' OR m.phone LIKE ? ESCAPE '\\')
       ORDER BY m.created_at DESC LIMIT 300`
    )
    .bind(like, like, like, like, like)
    .all()

  const totals = await db
    .prepare(
      `SELECT COUNT(*) AS total,
              SUM(CASE WHEN created_at >= ? THEN 1 ELSE 0 END) AS last7
       FROM members`
    )
    .bind(new Date(Date.now() - 7 * 86400 * 1000).toISOString())
    .first<{ total: number, last7: number | null }>()

  return { total: totals?.total ?? 0, last7: totals?.last7 ?? 0, members: results }
})
