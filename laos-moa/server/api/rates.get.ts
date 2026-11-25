interface RateResponse {
  result: string
  time_last_update_utc: string
  rates: Record<string, number>
}

// 하루 한 번 갱신되는 무료 기준 환율(ExchangeRate-API 오픈 엔드포인트)을 불러옵니다.
// 방문자마다 외부 API를 부르지 않도록 1시간 동안 캐시합니다.
export default defineCachedEventHandler(async () => {
  const res = await $fetch<RateResponse>('https://open.er-api.com/v6/latest/USD', { timeout: 8000 })

  const krw = res.rates?.KRW
  const lak = res.rates?.LAK

  if (res.result !== 'success' || !krw || !lak) {
    throw createError({ statusCode: 502, statusMessage: '환율 정보를 가져오지 못했습니다' })
  }

  return {
    updatedAt: res.time_last_update_utc,
    usdKrw: krw,
    usdLak: lak,
    krwLak: lak / krw
  }
}, {
  name: 'rates',
  maxAge: 60 * 60,
  swr: true
})
