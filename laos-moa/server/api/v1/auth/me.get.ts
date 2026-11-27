import { memberWithGrade } from '../../../utils/apiViews'
import { requireApiClient, requireApiMember } from '../../../utils/apiAuth'

// 회원 토큰이 아직 유효한지 확인하고 회원 정보를 돌려줍니다. (페이지를 열 때마다 호출해도 돼요)
export default defineEventHandler(async (event) => {
  const client = await requireApiClient(event, 'auth')
  const member = await requireApiMember(event, client)
  return { member: await memberWithGrade(useDB(event), member) }
})
