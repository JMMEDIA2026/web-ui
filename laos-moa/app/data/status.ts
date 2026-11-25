export const statusMeta = {
  pending: { label: '대기', color: 'warning' },
  confirmed: { label: '확정', color: 'success' },
  declined: { label: '거절', color: 'error' },
  completed: { label: '완료', color: 'neutral' },
  cancelled: { label: '취소', color: 'neutral' }
} as const

export type StatusKey = keyof typeof statusMeta

export const statusOptions = (Object.keys(statusMeta) as StatusKey[]).map(key => ({
  label: statusMeta[key].label,
  value: key
}))

// 서버(PARTNER_CATEGORIES)와 같은 목록으로 유지하세요.
export const partnerCategories = ['환전', '골프', '마사지', '오토바이 렌트', '티켓·여행코스', '식당', '기타']

export interface Reservation {
  id: string
  partner_id?: string
  partner_name?: string
  customer_name: string
  customer_contact: string
  service: string
  reserve_date: string
  people: number
  note: string
  status: StatusKey
  partner_memo: string
  created_at: string
}

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('ko-KR', {
    timeZone: 'Asia/Vientiane',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
