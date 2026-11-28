import { defaultRegion, regionByKey } from '~/data/regions'

const STORAGE_KEY = 'laosmoa:region'

// 선택한 지역. 이 기기에 기억해 두었다가 다음에도 같은 지역으로 시작합니다.
// 위치 권한은 요청하지 않고 사용자가 직접 고릅니다.
export function useRegion() {
  const key = useState<string>('region', () => defaultRegion.key)

  onMounted(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) key.value = regionByKey(saved).key
    } catch { /* 저장소를 쓸 수 없어도 동작해야 합니다. */ }
  })

  function setRegion(next: string) {
    key.value = regionByKey(next).key
    try { localStorage.setItem(STORAGE_KEY, key.value) } catch { /* 무시 */ }
  }

  return { regionKey: key, region: computed(() => regionByKey(key.value)), setRegion }
}
