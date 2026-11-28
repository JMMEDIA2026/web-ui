import { notifyReservationChange } from '../../../../utils/reservationNotify'

// 회원이 자기 예약을 취소합니다. 아직 업체가 확인하지 않은(확인 대기) 예약만 취소할 수 있어요.
export default defineEventHandler(async (event) => {
  assertSameOrigin(event)
  const member = await requireMember(event)
  const id = getRouterParam(event, 'id') ?? ''
  const db = useDB(event)

  const row = await db.prepare('SELECT status FROM reservations WHERE id = ? AND member_id = ?').bind(id, member.id).first<{ status: string }>()
  if (!row) throw createError({ statusCode: 404, statusMessage: '예약을 찾을 수 없어요' })
  if (row.status !== 'pending') {
    throw createError({
      statusCode: 400,
      statusMessage: row.status === 'confirmed' ? '확정된 예약은 업체에 직접 연락해서 취소해 주세요' : '이미 처리된 예약이라 취소할 수 없어요'
    })
  }
  // 그 사이 업체가 처리했을 수 있어서, 아직 '확인 대기'일 때만 바꿉니다.
  const result = await db.prepare("UPDATE reservations SET status = 'cancelled', updated_at = ? WHERE id = ? AND member_id = ? AND status = 'pending'").bind(nowIso(), id, member.id).run()
  if (!result.meta.changes) throw createError({ statusCode: 409, statusMessage: '그 사이에 예약이 처리됐어요. 화면을 새로고침해 주세요' })
  await notifyReservationChange(event, id, 'pending', 'cancelled', `회원 ${member.nickname} 취소`, false)
  return { ok: true, status: 'cancelled' }
})
