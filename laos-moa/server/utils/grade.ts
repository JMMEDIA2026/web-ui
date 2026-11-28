// 회원 등급: 활동 점수로 자동 계산합니다. (1~9등급은 회원, 10등급은 관리자 전용)
// 점수 = 가입 후 7일마다 1점 + 예약 요청 1건당 10점 + 문의 1건당 5점
// 등급 이름과 기준 점수는 아래 표만 고치면 화면 전체에 반영됩니다.
export const GRADE_RULES = { perWeek: 1, perReservation: 10, perInquiry: 5 }

export const GRADES = [
  { level: 1, name: '새싹', min: 0 },
  { level: 2, name: '새내기', min: 5 },
  { level: 3, name: '여행자', min: 15 },
  { level: 4, name: '단골', min: 30 },
  { level: 5, name: '탐험가', min: 60 },
  { level: 6, name: '베테랑', min: 100 },
  { level: 7, name: '라오통', min: 160 },
  { level: 8, name: '현지인', min: 250 },
  { level: 9, name: '마스터', min: 400 }
] as const

export const ADMIN_GRADE = { level: 10, name: '관리자' }

export interface GradeInfo {
  level: number
  name: string
  score: number
  /** 다음 등급 (최고 회원 등급이면 null) */
  next: { level: number, name: string, min: number, remaining: number } | null
}

export function memberGrade(input: { createdAt: string, reservations: number, inquiries: number }, now = Date.now()): GradeInfo {
  const days = Math.max(0, Math.floor((now - new Date(input.createdAt).getTime()) / 86400000))
  const score = Math.floor(days / 7) * GRADE_RULES.perWeek
    + input.reservations * GRADE_RULES.perReservation
    + input.inquiries * GRADE_RULES.perInquiry

  let current: (typeof GRADES)[number] = GRADES[0]
  for (const g of GRADES) if (score >= g.min) current = g
  const next = GRADES.find(g => g.level === current.level + 1)
  return {
    level: current.level,
    name: current.name,
    score,
    next: next ? { level: next.level, name: next.name, min: next.min, remaining: next.min - score } : null
  }
}

// 취소·거절된 예약은 점수에 넣지 않습니다. (점수 올리기용 가짜 예약 방지)
export const VALID_RESERVATION_SQL = "r.status NOT IN ('cancelled', 'declined')"
