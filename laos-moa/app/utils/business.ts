import type { Business } from '~/data/businesses'
import { categoryMap } from '~/data/businesses'
import type { Region } from '~/data/regions'

export const hasCoords = (b: Pick<Business, 'lat' | 'lng'>): boolean =>
  typeof b.lat === 'number' && typeof b.lng === 'number'

// 설치된 지도 앱 또는 웹 지도에서 목적지를 엽니다. 좌표가 없으면 주소로 찾습니다.
export function directionsUrl(b: Pick<Business, 'lat' | 'lng' | 'address'>): string | null {
  if (typeof b.lat === 'number' && typeof b.lng === 'number') {
    return `https://www.google.com/maps/dir/?api=1&destination=${b.lat},${b.lng}`
  }
  if (b.address) {
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(b.address)}`
  }
  return null
}

export type ContactAction =
  | { kind: 'tel', href: string, label: string }
  | { kind: 'link', href: string, label: string }
  | { kind: 'copy', text: string, label: string }

// 등록된 연락처 한 줄을 실제로 쓸 수 있는 동작으로 바꿉니다. 연락처가 없으면 null(버튼을 만들지 않음).
export function contactAction(contact: string | undefined): ContactAction | null {
  const value = (contact ?? '').trim()
  if (!value) return null
  if (/^https:\/\//i.test(value)) return { kind: 'link', href: value, label: '연락하기' }
  if (/^\+?\d[\d\s\-()]{5,}$/.test(value)) return { kind: 'tel', href: `tel:${value.replace(/[^\d+]/g, '')}`, label: '전화하기' }
  return { kind: 'copy', text: value, label: '연락처 복사' }
}

export function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const rad = (d: number) => (d * Math.PI) / 180
  const dLat = rad(bLat - aLat)
  const dLng = rad(bLng - aLng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(h))
}

export const formatDistance = (km: number): string =>
  km < 1 ? `${Math.max(10, Math.round(km * 100) * 10)}m` : `${km.toFixed(1)}km`

export const regionMatch = (b: Pick<Business, 'area' | 'address'>, region: Region): boolean => {
  const text = `${b.area ?? ''} ${b.address ?? ''}`
  return region.keywords.some(k => text.includes(k))
}

export const searchText = (b: Business): string =>
  `${b.name} ${categoryMap[b.category]?.label ?? ''} ${b.area ?? ''} ${b.address ?? ''} ${b.description ?? ''}`.toLowerCase()
