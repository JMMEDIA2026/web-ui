export type Tone = 'pink' | 'lilac' | 'peach' | 'mint' | 'sky' | 'sun'

// Tailwind가 클래스를 찾을 수 있도록 전체 문자열로 적어 둡니다.
export const toneBg: Record<Tone, string> = {
  pink: 'bg-tone-pink',
  lilac: 'bg-tone-lilac',
  peach: 'bg-tone-peach',
  mint: 'bg-tone-mint',
  sky: 'bg-tone-sky',
  sun: 'bg-tone-sun'
}
