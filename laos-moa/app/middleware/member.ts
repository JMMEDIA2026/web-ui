// 예약·문의처럼 개인정보가 필요한 화면은 회원만 들어갈 수 있습니다.
export default defineNuxtRouteMiddleware(async (to) => {
  const request = useRequestFetch()
  const res = await request<{ member: unknown }>('/api/members/me').catch(() => ({ member: null }))
  if (!res.member) {
    return navigateTo({ path: '/login', query: { next: to.fullPath, need: '1' } })
  }
})
