import type { Member } from '~/utils/member'

// 로그인한 회원 정보. 로그인하지 않았으면 member가 null입니다.
export function useMember() {
  const headers = useRequestHeaders(['cookie'])
  const { data, refresh, pending } = useFetch<{ member: Member | null }>('/api/members/me', {
    key: 'member',
    headers,
    default: () => ({ member: null })
  })
  const member = computed(() => data.value?.member ?? null)
  return { member, loggedIn: computed(() => !!member.value), refresh, pending }
}
