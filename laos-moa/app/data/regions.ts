// 지역 선택에 쓰는 도시 목록. center는 지도를 옮길 때 쓰는 도시 중심 좌표(대략)입니다.
export interface Region {
  key: string
  label: string
  /** 업체의 area·address 글자에 포함되면 이 지역으로 봅니다. */
  keywords: string[]
  center: { lat: number, lng: number, zoom: number }
}

export const regions: Region[] = [
  { key: 'vientiane', label: '비엔티안', keywords: ['비엔티안', 'Vientiane'], center: { lat: 17.9757, lng: 102.6331, zoom: 13 } },
  { key: 'vangvieng', label: '방비엥', keywords: ['방비엥', 'Vang Vieng'], center: { lat: 18.9229, lng: 102.4485, zoom: 14 } },
  { key: 'luangprabang', label: '루앙프라방', keywords: ['루앙프라방', 'Luang Prabang'], center: { lat: 19.8856, lng: 102.1347, zoom: 14 } },
  { key: 'pakse', label: '빡세', keywords: ['빡세', 'Pakse'], center: { lat: 15.1205, lng: 105.7996, zoom: 14 } }
]

export const defaultRegion = regions[0] as Region

export const regionByKey = (key: string | undefined | null): Region =>
  regions.find(r => r.key === key) ?? defaultRegion
