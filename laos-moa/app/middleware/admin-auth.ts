// 관리자 로그인 여부를 확인합니다.
// - 관리자 비밀번호로 들어왔거나, 10등급 관리자 회원이 최근 12시간 안에 로그인했다면 바로 열립니다.
// - 관리자 회원인데 12시간이 지났다면 회원 로그인 화면으로 보내고, 다시 로그인하면 관리자 화면이 바로 열립니다.
// - 그 외에는 관리자 비밀번호 화면으로 보냅니다.
export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return
  try {
    await $fetch('/api/admin/me')
    return
  } catch {
    // 아래에서 처리
  }
  const me = await $fetch<{ member: { role?: string } | null }>('/api/members/me').catch(() => ({ member: null }))
  if (me.member?.role === 'admin') {
    return navigateTo({ path: '/login', query: { next: to.fullPath, relogin: 'admin' } })
  }
  return navigateTo('/admin/login')
})
