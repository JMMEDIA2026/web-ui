// 글 삭제: 쓴 사람 또는 관리자
export default defineEventHandler(async (event) => {
  assertSameOrigin(event)
  const id = getRouterParam(event, 'id') ?? ''
  const db = useDB(event)
  const member = await readMember(event)
  const admin = await isAdminRequest(event)
  if (!member && !admin) throw createError({ statusCode: 401, statusMessage: '로그인이 필요해요' })

  const row = await db.prepare('SELECT member_id FROM community_posts WHERE id = ?').bind(id).first<{ member_id: string }>()
  if (!row) throw createError({ statusCode: 404, statusMessage: '글을 찾을 수 없어요' })
  if (!admin && row.member_id !== member?.id) throw createError({ statusCode: 403, statusMessage: '내가 쓴 글만 지울 수 있어요' })

  await db.prepare('DELETE FROM community_comments WHERE post_id = ?').bind(id).run()
  await db.prepare('DELETE FROM community_likes WHERE post_id = ?').bind(id).run()
  await db.prepare("DELETE FROM community_reports WHERE target_type = 'post' AND target_id = ?").bind(id).run()
  await db.prepare('DELETE FROM community_posts WHERE id = ?').bind(id).run()
  return { ok: true }
})
