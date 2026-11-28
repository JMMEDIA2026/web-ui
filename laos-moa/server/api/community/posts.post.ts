import { z } from 'zod'
import { BOARD_KEYS } from '../../utils/community'

const RATE_KIND = 'community-post'

const schema = z.object({
  board: z.enum(BOARD_KEYS, { message: '게시판을 골라 주세요' }),
  title: z.string().trim().min(2, '제목을 2자 이상 입력해 주세요').max(80, '제목은 80자까지 쓸 수 있어요'),
  body: z.string().trim().min(5, '내용을 5자 이상 입력해 주세요').max(3000, '내용은 3000자까지 쓸 수 있어요'),
  businessId: z.string().trim().max(60).default(''),
  rating: z.coerce.number().int().min(0).max(5).default(0),
  website: z.string().optional() // 스팸 방지용 숨김 필드
})

export default defineEventHandler(async (event) => {
  assertSameOrigin(event)
  const member = await requireMember(event)
  const data = await parseBody(event, schema)
  if (data.website) return { ok: true, id: '' }

  const db = useDB(event)
  // 한 회원이 10분에 5개까지만 올릴 수 있어요.
  const who = `m:${member.id}`
  if (await rateCount(db, who, RATE_KIND, 10 * 60 * 1000) >= 5) {
    throw createError({ statusCode: 429, statusMessage: '글을 너무 자주 올리고 있어요. 잠시 후 다시 시도해 주세요' })
  }

  // 후기에서만 업체와 별점을 받아요.
  let businessId = ''
  let rating = 0
  if (data.board === 'review') {
    if (data.businessId) {
      const b = await db.prepare('SELECT id FROM businesses WHERE id = ? AND active = 1').bind(data.businessId).first()
      if (!b) throw createError({ statusCode: 404, statusMessage: '업체를 찾을 수 없어요' })
      businessId = data.businessId
    }
    rating = data.rating
  }

  const id = `P${randomCode(8)}`
  await db
    .prepare('INSERT INTO community_posts (id, board, title, body, member_id, business_id, rating, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(id, data.board, data.title, data.body, member.id, businessId, rating, nowIso())
    .run()
  await rateAdd(db, who, RATE_KIND)
  return { ok: true, id }
})
