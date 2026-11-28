import { checkLogin, loginSchema } from '../../../utils/memberAuth'
import { memberWithGrade } from '../../../utils/apiViews'
import { signApiMemberToken } from '../../../utils/auth'
import { requireApiClient } from '../../../utils/apiAuth'

const RATE_KIND = 'api-login'

// 외부 사이트에서 로그인. 이메일·비밀번호가 맞으면 회원 토큰(30일)을 돌려줍니다.
export default defineEventHandler(async (event) => {
  const client = await requireApiClient(event, 'auth')
  const { email, password } = await parseBody(event, loginSchema)
  const db = useDB(event)

  // 같은 이메일로 10분에 8번 틀리면 잠시 막습니다. (어느 사이트에서 시도하든 합산)
  const who = `email:${email}`
  if (await rateCount(db, who, RATE_KIND, 10 * 60 * 1000) >= 8) {
    throw createError({ statusCode: 429, statusMessage: '시도가 너무 많아요. 10분 뒤에 다시 시도해 주세요' })
  }

  const memberId = await checkLogin(event, email, password)
  if (!memberId) {
    await rateAdd(db, who, RATE_KIND)
    throw createError({ statusCode: 401, statusMessage: '이메일 또는 비밀번호가 맞지 않아요. 다시 확인해 주세요' })
  }
  await rateClear(db, who, RATE_KIND)

  const member = await db
    .prepare('SELECT id, email, nickname, real_name, phone, gender, created_at, role FROM members WHERE id = ?')
    .bind(memberId)
    .first<MemberRow>()
  return { member: await memberWithGrade(db, member!), ...(await signApiMemberToken(event, memberId, client.id)) }
})
