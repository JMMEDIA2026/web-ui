import { z } from 'zod'
import { BOARD_KEYS } from '../../../../utils/community'
import { requireApiClient, requireApiMember } from '../../../../utils/apiAuth'

const schema = z.object({
  board: z.enum(BOARD_KEYS, { message: '게시판을 골라 주세요' }),
  title: z.string().trim().min(2, '제목을 2자 이상 입력해 주세요').max(80, '제목은 80자까지 쓸 수 있어요'),
  body: z.string().trim().min(5, '내용을 5자 이상 입력해 주세요').max(3000, '내용은 3000자까지 쓸 수 있어요'),
  businessId: z.string().trim().max(60).default(''),
  rating: z.coerce.number().int().min(0).max(5).default(0)
})

// 로그인한 회원의 이름으로 커뮤니티 글을 씁니다.
export default defineEventHandler(async (event) => {
  const client = await requireApiClient(event, 'community:write')
  const member = await requireApiMember(event, client)
  const data = await parseBody(event, schema)
  const db = useDB(event)

  const who = `m:${member.id}`
  if (await rateCount(db, who, 'community-post', 10 * 60 * 1000) >= 5) {
    throw createError({ statusCode: 429, statusMessage: '글을 너무 자주 올리고 있어요. 잠시 후 다시 시도해 주세요' })
  }
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
  await rateAdd(db, who, 'community-post')
  setResponseStatus(event, 201)
  return { ok: true, id }
})
