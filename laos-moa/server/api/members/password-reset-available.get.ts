import { mailConfigured } from '../../utils/mail'

// 비밀번호 찾기를 쓸 수 있는지(이메일 발송이 설정됐는지). 로그인 화면이 링크를 보일지 정하는 데 씁니다.
export default defineEventHandler((event) => {
  return { available: mailConfigured(event) }
})
