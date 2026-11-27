import type { H3Event } from 'h3'

// 이메일 발송 (Resend). Worker 비밀 값 MAIL_API_KEY 와 MAIL_FROM(보내는 주소)이 있어야 합니다.
// MAIL_API_URL 은 시험용으로만 바꿉니다. 기본값은 https://api.resend.com/emails
export function mailConfigured(event: H3Event): boolean {
  const env = cfEnv(event)
  return !!(env.MAIL_API_KEY && env.MAIL_FROM)
}

export async function sendMail(event: H3Event, to: string, subject: string, text: string): Promise<boolean> {
  const env = cfEnv(event)
  if (!env.MAIL_API_KEY || !env.MAIL_FROM) return false
  try {
    const res = await fetch(env.MAIL_API_URL || 'https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${env.MAIL_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env.MAIL_FROM, to: [to], subject, text })
    })
    if (!res.ok) console.error('[mail] 발송 실패', res.status)
    return res.ok
  } catch (error) {
    console.error('[mail] 발송 오류', error)
    return false
  }
}
