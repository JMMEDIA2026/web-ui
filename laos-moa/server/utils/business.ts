import { normalizeCategory } from '../../shared/utils/category'

// DB 행을 화면에서 쓰는 모양으로 바꿉니다.
export interface PublicBusiness {
  slug: string
  name: string
  category: string
  area: string
  address: string
  lat: number | null
  lng: number | null
  description: string
  hours: string
  contact: string
  mapUrl: string
  sponsored: boolean
  updatedAt: string
  partnerId: string | null
  /** 사진 ID 목록. 맨 앞이 대표(썸네일) 사진입니다. */
  photos: string[]
  example: false
}

export function toPublicBusiness(row: Record<string, unknown>): PublicBusiness {
  return {
    slug: String(row.id),
    name: String(row.name),
    category: normalizeCategory(String(row.category)),
    area: String(row.area ?? ''),
    address: String(row.address ?? ''),
    lat: typeof row.lat === 'number' ? row.lat : null,
    lng: typeof row.lng === 'number' ? row.lng : null,
    description: String(row.description ?? ''),
    hours: String(row.hours ?? ''),
    contact: String(row.contact ?? ''),
    mapUrl: String(row.map_url ?? ''),
    sponsored: row.sponsored === 1,
    updatedAt: String(row.updated_at ?? ''),
    partnerId: row.partner_id ? String(row.partner_id) : null,
    photos: row.photo_ids ? String(row.photo_ids).split(',') : [],
    example: false
  }
}
