import { z } from 'zod'

const RATE_KIND = 'community-comment'

export default defineEventHandler(async (event) => {
  assertSameOrigin(event)
  const member = await requireMember(event)
  const id = getRouterParam(event, 'id') ?? ''
  const data = await parseBody(event, z.object({
    body: z.string().trim().min(1, '댓글을 입력해 주세요').max(500, '댓글은 500자까지 쓸 수 있어요'),
    website: z.string().optional()
  }))
  if (data.website) return { ok: true }

  const db = useDB(event)
  const who = `m:${member.id}`
  if (await rateCount(db, who, RATE_KIND, 10 * 60 * 1000) >= 20) {
    throw createError({ statusCode: 429, statusMessage: '댓글을 너무 자주 달고 있어요. 잠시 후 다시 시도해 주세요' })
  }
  const post = await db.prepare('SELECT id FROM community_posts WHERE id = ? AND hidden = 0').bind(id).first()
  if (!post) throw createError({ statusCode: 404, statusMessage: '글을 찾을 수 없어요' })

  await db
    .prepare('INSERT INTO community_comments (id, post_id, member_id, body, created_at) VALUES (?, ?, ?, ?, ?)')
    .bind(`C${randomCode(8)}`, id, member.id, data.body, nowIso())
    .run()
  await db.prepare('UPDATE community_posts SET comment_count = comment_count + 1 WHERE id = ?').bind(id).run()
  await rateAdd(db, who, RATE_KIND)
  return { ok: true }
})
