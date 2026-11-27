import type { D1Database } from './db'
import { ADMIN_GRADE, VALID_RESERVATION_SQL, memberGrade } from './grade'
import type { MemberRow } from './member'
import { publicMember } from './member'

// 외부 사이트에 돌려주는 회원 모양 (비밀번호 해시는 절대 포함하지 않음)
export async function memberWithGrade(db: D1Database, member: MemberRow) {
  const counts = await db
    .prepare(
      `SELECT (SELECT COUNT(*) FROM reservations r WHERE r.member_id = ? AND ${VALID_RESERVATION_SQL}) AS reservations,
              (SELECT COUNT(*) FROM inquiries WHERE member_id = ?) AS inquiries`
    )
    .bind(member.id, member.id)
    .first<{ reservations: number, inquiries: number }>()
  return {
    ...publicMember(member),
    grade: member.role === 'admin'
      ? { level: ADMIN_GRADE.level, name: ADMIN_GRADE.name, score: 0, next: null }
      : memberGrade({ createdAt: member.created_at, reservations: counts?.reservations ?? 0, inquiries: counts?.inquiries ?? 0 })
  }
}

export const reservationView = (r: Record<string, unknown>) => ({
  id: r.id,
  businessId: r.business_id,
  businessName: r.business_name,
  partnerId: r.partner_id || null,
  memberId: r.member_id || null,
  customerName: r.customer_name,
  customerContact: r.customer_contact,
  service: r.service,
  date: r.reserve_date,
  people: r.people,
  note: r.note,
  status: r.status,
  createdAt: r.created_at,
  updatedAt: r.updated_at
})

export const inquiryView = (r: Record<string, unknown>) => ({
  id: r.id,
  company: r.company,
  contact: r.contact,
  product: r.product,
  message: r.message,
  status: r.status,
  memberId: r.member_id || null,
  createdAt: r.created_at
})
