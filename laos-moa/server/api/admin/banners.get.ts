import { bannerStatus, laosToday } from '../../utils/banner'

// 관리자: 모든 배너(숨김·예약·종료 포함)와 클릭 수
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  setResponseHeader(event, 'cache-control', 'no-store')
  const { results } = await useDB(event)
    .prepare('SELECT id, title, advertiser, link_url, active, sort_order, starts_at, ends_at, clicks, created_at, updated_at FROM banners ORDER BY sort_order, created_at')
    .all<{ id: string, title: string, advertiser: string, link_url: string, active: number, sort_order: number, starts_at: string, ends_at: string, clicks: number, created_at: string, updated_at: string }>()
  const today = laosToday()
  return results.map(b => ({ ...b, status: bannerStatus(b, today), v: Date.parse(b.updated_at) || 0 }))
})
