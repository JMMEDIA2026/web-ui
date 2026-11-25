// 협력업체 로그인 여부를 확인하고, 아니면 로그인 화면으로 보냅니다.
export default defineNuxtRouteMiddleware(async () => {
  if (import.meta.server) return
  try {
    await $fetch('/api/partner/me')
  } catch {
    return navigateTo('/partner/login')
  }
})
