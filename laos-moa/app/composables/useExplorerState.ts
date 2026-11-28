// 업체 탐색 화면의 상태(검색어·업종·선택·지도 위치·목록 위치).
// 상세 화면에 다녀오거나 하단 "업체" 메뉴로 돌아올 때 그대로 복원합니다.
export interface ExplorerState {
  q: string
  category: string
  region: string
  selected: string
  sort: string
  /** "이 지역에서 검색"을 누른 지도 영역 [남, 서, 북, 동] */
  bounds: [number, number, number, number] | null
  map: { lat: number, lng: number, zoom: number } | null
  scroll: number
  expanded: boolean
}

const STORAGE_KEY = 'laosmoa:explorer'

export const emptyExplorerState = (region: string): ExplorerState => ({
  q: '',
  category: '',
  region,
  selected: '',
  sort: 'default',
  bounds: null,
  map: null,
  scroll: 0,
  expanded: false
})

export function useExplorerState() {
  const state = useState<ExplorerState | null>('explorer-state', () => null)

  function load(): ExplorerState | null {
    if (state.value) return state.value
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (raw) state.value = JSON.parse(raw) as ExplorerState
    } catch { /* 무시 */ }
    return state.value
  }

  function save(next: ExplorerState) {
    state.value = next
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* 무시 */ }
  }

  return { state, load, save }
}
