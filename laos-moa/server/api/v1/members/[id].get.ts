import { memberWithGrade } from '../../../utils/apiViews'
import { requireApiClient } from '../../../utils/apiAuth'

export default defineEventHandler(async (event) => {
  await requireApiClient(event, 'members:read')
  const id = getRouterParam(event, 'id') ?? ''
  const db = useDB(event)
  const member = await db
    .prepare('SELECT id, email, nickname, real_name, phone, gender, created_at, role FROM members WHERE id = ?')
    .bind(id)
    .first<MemberRow>()
  if (!member) throw createError({ statusCode: 404, statusMessage: '회원을 찾을 수 없어요' })
  return { member: await memberWithGrade(db, member) }
})
