import { z } from 'zod'

// 회원 탈퇴: 비밀번호를 다시 확인한 뒤 회원 정보를 삭제합니다.
export default defineEventHandler(async (event) => {
  assertSameOrigin(event)
  const member = await requireMember(event)
  const { password } = await parseBody(event, z.object({ password: z.string().min(1, '비밀번호를 입력해 주세요').max(200) }))
  const db = useDB(event)
  const ip = clientIp(event)

  if (await rateCount(db, ip, 'member-delete', 10 * 60 * 1000) >= 5) {
    throw createError({ statusCode: 429, statusMessage: '시도가 너무 많아요. 10분 뒤에 다시 시도해 주세요' })
  }

  const row = await db.prepare('SELECT password_hash FROM members WHERE id = ?').bind(member.id).first<{ password_hash: string }>()
  if (!row || !(await verifySecret(password, row.password_hash))) {
    await rateAdd(db, ip, 'member-delete')
    throw createError({ statusCode: 401, statusMessage: '비밀번호가 맞지 않아요' })
  }

  // 예약·문의 기록은 처리 이력으로 남기되 회원과의 연결은 끊습니다.
  await db.prepare("UPDATE reservations SET member_id = '' WHERE member_id = ?").bind(member.id).run()
  await db.prepare("UPDATE inquiries SET member_id = '' WHERE member_id = ?").bind(member.id).run()
  await db.prepare('DELETE FROM members WHERE id = ?').bind(member.id).run()
  endMemberSession(event)
  return { ok: true }
})
