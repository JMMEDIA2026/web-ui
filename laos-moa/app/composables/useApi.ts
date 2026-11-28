// 관리자/협력업체 전용 API 호출. 로그인이 풀리면(401) 로그인 화면으로 보냅니다.
export function useApi(kind: 'admin' | 'partner') {
  const loginPath = kind === 'admin' ? '/admin/login' : '/partner/login'

  return $fetch.create({
    baseURL: `/api/${kind}`,
    onResponseError({ response }) {
      if (response.status === 401) {
        navigateTo(loginPath)
      }
    }
  })
}

export function errorMessage(error: unknown, fallback = '요청에 실패했습니다. 잠시 후 다시 시도해 주세요.'): string {
  const e = error as { data?: { statusMessage?: string, message?: string }, statusMessage?: string } | undefined
  return e?.data?.statusMessage || e?.data?.message || e?.statusMessage || fallback
}
