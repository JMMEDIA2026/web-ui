// 연락 방법(전화·카카오톡·위챗·텔레그램·왓츠앱·라인)을 고르고, 보여 주고, 복사하는 데 쓰는 공통 코드.
// 앱 화면과 서버(저장할 때 검사)가 같은 규칙을 씁니다.

export type ContactType = 'phone' | 'kakao' | 'wechat' | 'telegram' | 'whatsapp' | 'line' | 'etc'

export interface ContactItem {
  type: ContactType
  value: string
}

export interface ContactTypeInfo {
  key: ContactType
  label: string
  /** 짧은 이름(좁은 버튼용) */
  short: string
  emoji: string
  placeholder: string
  /** 배지 색: 바탕과 글자색 (글자 대비 4.5:1 이상) */
  chip: string
}

export const CONTACT_TYPES: ContactTypeInfo[] = [
  { key: 'phone', label: '전화', short: '전화', emoji: '📞', placeholder: '+856 20 1234 5678', chip: 'bg-[#EEF0F4] text-[#17181C]' },
  { key: 'kakao', label: '카카오톡', short: '카톡', emoji: '💬', placeholder: '카카오톡 ID', chip: 'bg-[#FEE500] text-[#191919]' },
  { key: 'wechat', label: '위챗', short: '위챗', emoji: '🟢', placeholder: '위챗 ID', chip: 'bg-[#E3F6EA] text-[#0A6B35]' },
  { key: 'telegram', label: '텔레그램', short: '텔레그램', emoji: '✈️', placeholder: '@아이디 또는 전화번호', chip: 'bg-[#E1F3FC] text-[#0B5E8E]' },
  { key: 'whatsapp', label: '왓츠앱', short: '왓츠앱', emoji: '📲', placeholder: '+856 20 1234 5678', chip: 'bg-[#E2F7E8] text-[#0B6B2E]' },
  { key: 'line', label: '라인', short: '라인', emoji: '🟩', placeholder: 'LINE ID', chip: 'bg-[#E0F6E7] text-[#0A6B2F]' },
  { key: 'etc', label: '기타', short: '연락처', emoji: '🔗', placeholder: '연락 방법과 주소', chip: 'bg-[#EEF0F4] text-[#17181C]' }
]

export const contactTypeMap = Object.fromEntries(CONTACT_TYPES.map(t => [t.key, t])) as Record<ContactType, ContactTypeInfo>

export const MAX_CONTACTS = 5
const TYPE_KEYS = new Set<string>(CONTACT_TYPES.map(t => t.key))
const PHONE_RE = /^\+?\d[\d\s\-()]{5,}$/
const digitsOf = (v: string) => v.replace(/\D/g, '')

/** 옛날 방식(글자 한 줄)과 새 방식(JSON 목록)을 모두 읽어서 목록으로 돌려줍니다. */
export function parseContacts(raw: string | null | undefined): ContactItem[] {
  const text = (raw ?? '').trim()
  if (!text) return []
  if (text.startsWith('[')) {
    try {
      const arr = JSON.parse(text) as unknown
      if (Array.isArray(arr)) {
        return arr
          .map((x) => {
            const o = x as { t?: unknown, v?: unknown }
            return { type: String(o.t) as ContactType, value: String(o.v ?? '').trim() }
          })
          .filter(i => TYPE_KEYS.has(i.type) && i.value)
          .slice(0, MAX_CONTACTS)
      }
    } catch {
      // 아래의 옛날 방식으로 처리
    }
  }
  return [{ type: PHONE_RE.test(text) ? 'phone' : 'etc', value: text }]
}

/** 목록을 저장용 글자로 바꿉니다. 비어 있으면 빈 글자. */
export function serializeContacts(items: ContactItem[]): string {
  const clean = items.map(i => ({ t: i.type, v: i.value.trim() })).filter(i => i.v).slice(0, MAX_CONTACTS)
  return clean.length ? JSON.stringify(clean) : ''
}

/** 입력한 한 항목이 맞는지 확인합니다. 문제가 없으면 null, 있으면 안내 문구. */
export function contactProblem(item: ContactItem): string | null {
  const v = item.value.trim()
  const info = contactTypeMap[item.type]
  if (!info) return '연락 방법을 골라 주세요.'
  if (v.length < 2) return `${info.label} 정보를 입력해 주세요.`
  if (v.length > 80) return `${info.label} 정보가 너무 길어요.`
  if ((item.type === 'phone' || item.type === 'whatsapp') && digitsOf(v).length < 6) return `${info.label} 번호를 확인해 주세요.`
  return null
}

/** 서버 저장 검사: 비었거나 옛날 한 줄(100자 이하)이거나, 올바른 JSON 목록이면 true */
export function isValidContactString(raw: string): boolean {
  const text = raw.trim()
  if (!text) return true
  if (!text.startsWith('[')) return text.length <= 100
  if (text.length > 900) return false
  try {
    const arr = JSON.parse(text) as unknown
    if (!Array.isArray(arr) || arr.length > MAX_CONTACTS) return false
    return arr.every((x) => {
      const o = x as { t?: unknown, v?: unknown }
      return typeof o.t === 'string' && typeof o.v === 'string' && contactProblem({ type: o.t as ContactType, value: o.v }) === null
    })
  } catch {
    return false
  }
}

/** 누르면 바로 열 수 있는 주소. 열 수 없는 종류(카톡·위챗·라인)는 null → 아이디 복사만 */
export function contactHref(item: ContactItem): string | null {
  const v = item.value.trim()
  if (item.type === 'phone' && PHONE_RE.test(v)) return `tel:${v.replace(/[^\d+]/g, '')}`
  if (item.type === 'whatsapp' && digitsOf(v).length >= 6) return `https://wa.me/${digitsOf(v)}`
  if (item.type === 'telegram') {
    const name = v.replace(/^@/, '')
    if (/^[A-Za-z][A-Za-z0-9_]{3,31}$/.test(name)) return `https://t.me/${name}`
    if (PHONE_RE.test(v)) return `https://t.me/+${digitsOf(v)}`
  }
  return null
}

/** 예약·문의 같은 한 줄 입력용: "카카오톡: vip3885" (전화는 번호만) */
export function encodeContactLine(item: ContactItem): string {
  const v = item.value.trim()
  if (!v) return ''
  return item.type === 'phone' ? v : `${contactTypeMap[item.type].label}: ${v}`
}

export function decodeContactLine(line: string | null | undefined): ContactItem {
  const text = (line ?? '').trim()
  for (const t of CONTACT_TYPES) {
    if (t.key !== 'phone' && text.startsWith(`${t.label}: `)) return { type: t.key, value: text.slice(t.label.length + 2) }
  }
  return { type: 'phone', value: text }
}
