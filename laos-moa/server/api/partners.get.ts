// 예약 폼에 보여 줄 협력업체 목록 (로그인 정보는 포함하지 않습니다)
export default defineEventHandler(async (event) => {
  const { results } = await useDB(event)
    .prepare('SELECT id, name, category FROM partners WHERE active = 1 ORDER BY category, name')
    .all()

  return results
})
