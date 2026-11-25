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
  partnerId: string | null
  example: false
}

export function toPublicBusiness(row: Record<string, unknown>): PublicBusiness {
  return {
    slug: String(row.id),
    name: String(row.name),
    category: String(row.category),
    area: String(row.area ?? ''),
    address: String(row.address ?? ''),
    lat: typeof row.lat === 'number' ? row.lat : null,
    lng: typeof row.lng === 'number' ? row.lng : null,
    description: String(row.description ?? ''),
    hours: String(row.hours ?? ''),
    contact: String(row.contact ?? ''),
    mapUrl: String(row.map_url ?? ''),
    sponsored: row.sponsored === 1,
    partnerId: row.partner_id ? String(row.partner_id) : null,
    example: false
  }
}
