import type { H3Event } from 'h3'
import { mailConfigured, sendMail } from './mail'

const LABEL: Record<string, string> = { pending: '확인 대기', confirmed: '예약 확정', declined: '예약 불가', completed: '이용 완료', cancelled: '취소됨' }
const HINT: Record<string, string> = {
  confirmed: '예약이 확정됐어요. 날짜에 맞춰 방문해 주세요.',
  declined: '이번에는 어려워요. 다른 날짜나 업체로 다시 요청해 보세요.',
  cancelled: '예약이 취소됐어요.'
}

// 예약 상태가 바뀌면 운영 Slack에 알리고, 이메일 발송이 설정돼 있으면 회원에게도 메일을 보냅니다.
// source 는 누가 바꿨는지(예: 관리자, 협력업체, 회원 취소, API 사이트 이름)이고, notifyMember=false 면 회원 메일은 건너뜁니다.
export async function notifyReservationChange(event: H3Event, id: string, oldStatus: string, newStatus: string, source: string, notifyMember = true): Promise<void> {
  if (oldStatus === newStatus) return
  try {
    const r = await useDB(event)
      .prepare(
        `SELECT r.business_name, r.reserve_date, m.email
         FROM reservations r LEFT JOIN members m ON m.id = r.member_id WHERE r.id = ?`
      )
      .bind(id)
      .first<{ business_name: string, reserve_date: string, email: string | null }>()
    await notify(event, `[라자] 예약 ${id} ${LABEL[oldStatus] ?? oldStatus} → ${LABEL[newStatus] ?? newStatus} (${source}) — ${r?.business_name || '업체 정보 없음'} / ${r?.reserve_date ?? ''}`)

    if (notifyMember && r?.email && HINT[newStatus] && mailConfigured(event)) {
      await sendMail(
        event,
        r.email,
        '[라자] 예약 상태가 바뀌었어요',
        `${r.business_name || '예약한 업체'} · ${r.reserve_date}\n상태: ${LABEL[newStatus]}\n\n${HINT[newStatus]}\n\n자세한 내용은 라자 > 내 정보 > 내 예약에서 볼 수 있어요.`
      )
    }
  } catch (error) {
    // 알림 실패가 예약 처리를 막으면 안 됩니다.
    console.error('[notify] 예약 알림 실패', error)
  }
}
