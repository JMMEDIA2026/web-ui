import { createMember, signupSchema } from '../../../utils/memberAuth'
import { memberWithGrade } from '../../../utils/apiViews'
import { signApiMemberToken } from '../../../utils/auth'
import { requireApiClient } from '../../../utils/apiAuth'

const RATE_KIND = 'api-signup'

// 외부 사이트에서 회원가입. 가입과 동시에 로그인 토큰을 돌려줍니다.
export default defineEventHandler(async (event) => {
  const client = await requireApiClient(event, 'auth')
  const data = await parseBody(event, signupSchema)
  const db = useDB(event)

  // 한 키로 1시간에 30명까지 가입시킬 수 있어요. (대량 가짜 가입 방지)
  const who = `api:${client.id}`
  if (await rateCount(db, who, RATE_KIND, 3600 * 1000) >= 30) {
    throw createError({ statusCode: 429, statusMessage: '가입 요청이 너무 많아요. 잠시 후 다시 시도해 주세요' })
  }
  const id = await createMember(event, data, client.id)
  await rateAdd(db, who, RATE_KIND)

  const member = await db
    .prepare('SELECT id, email, nickname, real_name, phone, gender, created_at, role FROM members WHERE id = ?')
    .bind(id)
    .first<MemberRow>()
  setResponseStatus(event, 201)
  return { member: await memberWithGrade(db, member!), ...(await signApiMemberToken(event, id, client.id)) }
})
