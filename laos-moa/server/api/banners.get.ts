import { LIVE_BANNER_SQL, laosToday } from '../utils/banner'

// 메인에 노출 중인 배너 목록 (켜져 있고 기간 안인 것만, 순서대로)
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'cache-control', 'public, max-age=30')
  const { results } = await useDB(event)
    .prepare(
      `SELECT b.id, b.title, b.link_url, b.updated_at
       FROM banners b WHERE ${LIVE_BANNER_SQL}
       ORDER BY b.sort_order, b.created_at LIMIT 8`
    )
    .bind(laosToday())
    .all<{ id: string, title: string, link_url: string, updated_at: string }>()

  return results.map(r => ({
    id: r.id,
    title: r.title,
    linkUrl: r.link_url,
    // 이미지가 바뀌면 주소가 바뀌도록 수정 시각을 붙입니다.
    v: Date.parse(r.updated_at) || 0
  }))
})
