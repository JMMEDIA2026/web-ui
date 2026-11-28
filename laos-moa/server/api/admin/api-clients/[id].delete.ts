// 키를 완전히 삭제합니다. (그 키로 발급한 회원 토큰도 함께 쓸 수 없게 됩니다)
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id') ?? ''
  await useDB(event).prepare('DELETE FROM api_clients WHERE id = ?').bind(id).run()
  return { ok: true }
})
