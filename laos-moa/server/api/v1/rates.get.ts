import { requireApiClient } from '../../utils/apiAuth'

// 기준 환율(달러·원·킵). 라자 환율 화면과 같은 값이며 하루 한 번쯤 갱신돼요. 참고용입니다.
export default defineEventHandler(async (event) => {
  await requireApiClient(event, 'content:read')
  const r = await $fetch<{ updatedAt: string, usdKrw: number, usdLak: number, krwLak: number }>('/api/rates')
  return {
    updatedAt: r.updatedAt,
    base: 'USD',
    rates: { USD_KRW: r.usdKrw, USD_LAK: r.usdLak, KRW_LAK: r.krwLak },
    note: '국제 기준 환율이며 환전소의 실제 환율과 다를 수 있어요'
  }
})
