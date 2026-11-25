// 메인 배너 공통 규칙

// 라오스 시간(UTC+7) 기준 오늘 날짜 (YYYY-MM-DD)
export function laosToday(now = Date.now()): string {
  return new Date(now + 7 * 3600 * 1000).toISOString().slice(0, 10)
}

// 지금 노출 중인지: 켜져 있고, 시작일 이후, 종료일(포함) 이전
export const LIVE_BANNER_SQL = "b.active = 1 AND (b.starts_at = '' OR b.starts_at <= ?1) AND (b.ends_at = '' OR b.ends_at >= ?1)"

// 눌렀을 때 이동할 주소: 사이트 안 경로 또는 https 주소만 허용합니다. (javascript: 같은 주소 차단)
export function cleanLink(value: string): string | null {
  const v = value.trim()
  if (v === '') return ''
  if (v.startsWith('/') && !v.startsWith('//') && !v.startsWith('/\\') && !/[\s\u0000-\u001F]/.test(v)) return v
  try {
    const u = new URL(v)
    if (u.protocol === 'https:' && !/[\s\u0000-\u001F]/.test(v)) return u.toString()
  } catch {
    // 아래에서 null
  }
  return null
}

export const MAX_BANNER_B64 = 1_300_000
export const MAX_BANNERS = 12

export function bannerStatus(b: { active: number, starts_at: string, ends_at: string }, today: string): 'live' | 'hidden' | 'scheduled' | 'ended' {
  if (!b.active) return 'hidden'
  if (b.starts_at && b.starts_at > today) return 'scheduled'
  if (b.ends_at && b.ends_at < today) return 'ended'
  return 'live'
}
