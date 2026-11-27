import { z } from 'zod'
import { ADMIN_GRADE, VALID_RESERVATION_SQL, memberGrade } from '../../../utils/grade'
import { pageParams, requireApiClient } from '../../../utils/apiAuth'

// 회원 목록 (실명·휴대폰 포함이라 members:read 권한이 있는 키만). 비밀번호 해시는 내려보내지 않습니다.
export default defineEventHandler(async (event) => {
  await requireApiClient(event, 'members:read')
  const { limit, offset } = pageParams(event)
  const q = z.object({ q: z.string().trim().max(60).optional(), since: z.string().max(40).optional() }).parse(getQuery(event))
  const like = q.q ? `%${q.q.toLowerCase().replace(/[\\%_]/g, m => `\\${m}`)}%` : ''
  const since = q.since ?? ''
  const db = useDB(event)

  const where = `(? = '' OR lower(m.nickname) LIKE ? ESCAPE '\\' OR lower(m.email) LIKE ? ESCAPE '\\' OR lower(m.real_name) LIKE ? ESCAPE '\\' OR m.phone LIKE ? ESCAPE '\\')
       AND (? = '' OR m.created_at >= ?)`
  const binds = [like, like, like, like, like, since, since]
  const total = await db.prepare(`SELECT COUNT(*) AS n FROM members m WHERE ${where}`).bind(...binds).first<{ n: number }>()
  const { results } = await db
    .prepare(
      `SELECT m.id, m.email, m.nickname, m.real_name, m.phone, m.gender, m.role, m.created_at, m.last_login_at, m.signup_client,
              (SELECT COUNT(*) FROM reservations r WHERE r.member_id = m.id AND ${VALID_RESERVATION_SQL}) AS reservations,
              (SELECT COUNT(*) FROM inquiries i WHERE i.member_id = m.id) AS inquiries
       FROM members m WHERE ${where} ORDER BY m.created_at DESC, m.id LIMIT ? OFFSET ?`
    )
    .bind(...binds, limit, offset)
    .all<Record<string, unknown>>()

  return {
    total: total?.n ?? 0,
    limit,
    offset,
    items: results.map((m) => {
      const g = m.role === 'admin' ? { ...ADMIN_GRADE, score: 0 } : memberGrade({ createdAt: String(m.created_at), reservations: Number(m.reservations), inquiries: Number(m.inquiries) })
      return {
        id: m.id,
        email: m.email,
        nickname: m.nickname,
        realName: m.real_name,
        phone: m.phone,
        gender: m.gender,
        role: m.role,
        createdAt: m.created_at,
        lastLoginAt: m.last_login_at || null,
        signupClient: m.signup_client || null,
        grade: { level: g.level, name: g.name, score: g.score }
      }
    })
  }
})
