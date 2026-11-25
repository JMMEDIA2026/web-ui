import type { Business } from '~/data/businesses'
import { businesses as examples } from '~/data/businesses'

// 등록된 업체(DB)를 먼저, 화면 구성용 예시 업체를 뒤에 보여 줍니다.
// 예시 업체에는 항상 "예시" 표시가 붙습니다.
export async function useBusinessList() {
  const { data } = await useFetch<Business[]>('/api/businesses', {
    key: 'businesses',
    default: () => []
  })

  const real = computed(() => data.value ?? [])
  const all = computed<Business[]>(() => [...real.value, ...examples])

  return { all, real }
}
