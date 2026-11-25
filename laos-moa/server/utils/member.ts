import type { H3Event } from 'h3'

export interface MemberRow {
  id: string
  email: string
  nickname: string
  real_name: string
  phone: string
  gender: string
  created_at: string
  role: string
}

// 로그인한 회원을 DB에서 다시 확인합니다. (탈퇴한 회원의 쿠키는 바로 무효)
export async function readMember(event: H3Event): Promise<MemberRow | null> {
  const id = await readMemberId(event)
  if (!id) return null
  return await useDB(event)
    .prepare('SELECT id, email, nickname, real_name, phone, gender, created_at, role FROM members WHERE id = ?')
    .bind(id)
    .first<MemberRow>()
}

export async function requireMember(event: H3Event): Promise<MemberRow> {
  const member = await readMember(event)
  if (!member) {
    throw createError({ statusCode: 401, statusMessage: '로그인이 필요합니다. 회원가입 또는 로그인 후 이용해 주세요' })
  }
  return member
}

// 화면에 돌려주는 모양 (비밀번호 해시 등은 포함하지 않음)
export const publicMember = (m: MemberRow) => ({
  id: m.id,
  email: m.email,
  nickname: m.nickname,
  realName: m.real_name,
  phone: m.phone,
  gender: m.gender,
  role: m.role,
  createdAt: m.created_at
})
