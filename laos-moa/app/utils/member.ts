// 로그인 후 돌아갈 주소: 사이트 안의 경로만 허용합니다. (외부 주소로 보내는 공격 방지)
export function safeNext(value: unknown, fallback = '/me'): string {
  if (typeof value !== 'string') return fallback
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return fallback
  return value
}

export interface Member {
  id: string
  email: string
  nickname: string
  realName: string
  phone: string
  gender: 'M' | 'F' | 'N'
  createdAt: string
  grade?: { level: number, name: string, score: number, next: { level: number, name: string, min: number, remaining: number } | null }
}

export const genderLabel: Record<string, string> = { M: '남성', F: '여성', N: '선택 안 함' }
