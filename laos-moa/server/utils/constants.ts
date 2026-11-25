export const RESERVATION_STATUSES = ['pending', 'confirmed', 'declined', 'completed', 'cancelled'] as const
export type ReservationStatus = (typeof RESERVATION_STATUSES)[number]

// 협력업체가 직접 바꿀 수 있는 상태
export const PARTNER_STATUSES = ['confirmed', 'declined', 'completed'] as const

export const PARTNER_CATEGORIES = ['환전', '골프', '마사지', '오토바이 렌트', '티켓·여행코스', '식당', '기타'] as const

export const INQUIRY_STATUSES = ['new', 'done'] as const
