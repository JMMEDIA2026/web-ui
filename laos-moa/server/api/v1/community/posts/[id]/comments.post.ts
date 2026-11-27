import { z } from 'zod'
import { requireApiClient, requireApiMember } from '../../../../../utils/apiAuth'

// 로그인한 회원의 이름으로 댓글을 씁니다.
export default defineEventHandler(async (event) => {
  const client = await requireApiClient(event, 'community:write')
  const member = await requireApiMember(event, client)
  const id = getRouterParam(event, 'id') ?? ''
  const data = await parseBody(event, z.object({ body: z.string().trim().min(1, '댓글을 입력해 주세요').max(500, '댓글은 500자까지 쓸 수 있어요') }))
  const db = useDB(event)

  const who = `m:${member.id}`
  if (await rateCount(db, who, 'community-comment', 10 * 60 * 1000) >= 20) {
    throw createError({ statusCode: 429, statusMessage: '댓글을 너무 자주 달고 있어요. 잠시 후 다시 시도해 주세요' })
  }
  const post = await db.prepare('SELECT id FROM community_posts WHERE id = ? AND hidden = 0').bind(id).first()
  if (!post) throw createError({ statusCode: 404, statusMessage: '글을 찾을 수 없어요' })
  const commentId = `C${randomCode(8)}`
  await db
    .prepare('INSERT INTO community_comments (id, post_id, member_id, body, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind(commentId, id, member.id, data.body, nowIso())
    .run()
  await db.prepare('UPDATE community_posts SET comment_count = comment_count + 1 WHERE id = ?').bind(id).run()
  await rateAdd(db, who, 'community-comment')
  setResponseStatus(event, 201)
  return { ok: true, id: commentId }
})
