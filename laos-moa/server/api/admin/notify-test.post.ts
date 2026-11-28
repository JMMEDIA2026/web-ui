// 관리자 전용: Slack 알림이 연결됐는지 시험 메시지를 보내 확인합니다.
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const result = await sendWebhook(event, '[라자] 알림 연결 시험입니다. 이 메시지가 보이면 Slack 알림이 정상으로 연결된 거예요.')
  return result
})
