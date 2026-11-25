export const RESERVATION_STATUSES = ['pending', 'confirmed', 'declined', 'completed', 'cancelled'] as const
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number]

// 협력업체가 직접 바꿀 수 있는 상태
export const PARTNER_STATUSES = ['confirmed', 'declined', 'completed'] as const

export const PARTNER_CATEGORIES = ['환전', '골프', '마사지', '오토바이 렌트', '티켓·여행코스', '식당', '기타'] as const

export const INQUIRY_STATUSES = ['new', 'done'] as const

// 사이트 업체 분류. 화면(app/data/businesses.ts)의 category key와 같게 유지하세요.
export const BUSINESS_CATEGORIES = ['food', 'mart', 'exchange', 'massage', 'hospital', 'school', 'rent', 'job'] as const

// 공개 API가 돌려주는 업체 필드 (협력업체 로그인 정보는 포함하지 않습니다)
export const BUSINESS_SELECT = `
  b.id, b.name, b.category, b.area, b.address, b.lat, b.lng, b.description, b.hours, b.contact,
  b.map_url, b.sponsored, b.updated_at,
  CASE WHEN p.id IS NOT NULL THEN p.id ELSE NULL END AS partner_id
`
