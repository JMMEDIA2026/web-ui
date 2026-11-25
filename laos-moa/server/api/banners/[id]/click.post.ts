import { laosToday } from '../../../utils/banner'

const RATE_KIND = 'banner-click'

// 배너 클릭 수 세기. 한 곳에서 1시간에 60번까지만 셉니다. (수치 부풀리기 방지)
export default defineEventHandler(async (event) => {
  assertSameOrigin(event)
  const id = getRouterParam(event, 'id') ?? ''
  const db = useDB(event)
  const ip = clientIp(event)

  if (await rateCount(db, ip, RATE_KIND, 3600 * 1000) >= 60) {
    setResponseStatus(event, 204)
    return null
  }
  await db
    .prepare("UPDATE banners SET clicks = clicks + 1 WHERE id = ?2 AND active = 1 AND (starts_at = '' OR starts_at <= ?1) AND (ends_at = '' OR ends_at >= ?1)")
    .bind(laosToday(), id)
    .run()
  await rateAdd(db, ip, RATE_KIND)
  setResponseStatus(event, 204)
  return null
})
