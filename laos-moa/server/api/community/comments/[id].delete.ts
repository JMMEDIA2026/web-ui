// 댓글 삭제: 쓴 사람 또는 관리자
export default defineEventHandler(async (event) => {
  assertSameOrigin(event)
  const id = getRouterParam(event, 'id') ?? ''
  const db = useDB(event)
  const member = await readMember(event)
  const admin = await isAdminRequest(event)
  if (!member && !admin) throw createError({ statusCode: 401, statusMessage: '로그인이 필요해요' })

  const row = await db.prepare('SELECT member_id, post_id FROM community_comments WHERE id = ?').bind(id).first<{ member_id: string, post_id: string }>()
  if (!row) throw createError({ statusCode: 404, statusMessage: '댓글을 찾을 수 없어요' })
  if (!admin && row.member_id !== member?.id) throw createError({ statusCode: 403, statusMessage: '내가 쓴 댓글만 지울 수 있어요' })

  await db.prepare('DELETE FROM community_comments WHERE id = ?').bind(id).run()
  await db.prepare("DELETE FROM community_reports WHERE target_type = 'comment' AND target_id = ?").bind(id).run()
  await db
    .prepare('UPDATE community_posts SET comment_count = (SELECT COUNT(*) FROM community_comments WHERE post_id = ? AND hidden = 0) WHERE id = ?')
    .bind(row.post_id, row.post_id)
    .run()
  return { ok: true }
})
