// 좋아요 켜기/끄기
export default defineEventHandler(async (event) => {
  assertSameOrigin(event)
  const member = await requireMember(event)
  const id = getRouterParam(event, 'id') ?? ''
  const db = useDB(event)

  const post = await db.prepare('SELECT id FROM community_posts WHERE id = ? AND hidden = 0').bind(id).first()
  if (!post) throw createError({ statusCode: 404, statusMessage: '글을 찾을 수 없어요' })

  const existing = await db.prepare('SELECT 1 AS x FROM community_likes WHERE post_id = ? AND member_id = ?').bind(id, member.id).first()
  if (existing) {
    await db.prepare('DELETE FROM community_likes WHERE post_id = ? AND member_id = ?').bind(id, member.id).run()
  } else {
    await db.prepare('INSERT INTO community_likes (post_id, member_id, created_at) VALUES (?, ?, ?)').bind(id, member.id, nowIso()).run()
  }
  const n = await db.prepare('SELECT COUNT(*) AS n FROM community_likes WHERE post_id = ?').bind(id).first<{ n: number }>()
  await db.prepare('UPDATE community_posts SET like_count = ? WHERE id = ?').bind(n?.n ?? 0, id).run()
  return { liked: !existing, likeCount: n?.n ?? 0 }
})
