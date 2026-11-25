import type { Business } from '~/data/businesses'

// 사이트에 등록된 실제 업체(DB). 화면 구성용 예시 업체는 보여 주지 않습니다.
export async function useBusinessList() {
  const { data, pending, error, refresh } = await useFetch<Business[]>('/api/businesses', {
    key: 'businesses',
    default: () => []
  })

  const real = computed(() => data.value ?? [])

  return { real, pending, error, refresh }
}
