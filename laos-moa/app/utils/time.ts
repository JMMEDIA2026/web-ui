// "방금 전", "5분 전", "3시간 전", "2일 전", 그 이후는 날짜
export function timeAgo(iso: string): string {
  const t = Date.parse(iso)
  if (!Number.isFinite(t)) return ''
  const sec = Math.max(0, Math.round((Date.now() - t) / 1000))
  if (sec < 60) return '방금 전'
  if (sec < 3600) return `${Math.floor(sec / 60)}분 전`
  if (sec < 86400) return `${Math.floor(sec / 3600)}시간 전`
  if (sec < 86400 * 7) return `${Math.floor(sec / 86400)}일 전`
  return new Date(t).toLocaleDateString('ko-KR', { timeZone: 'Asia/Vientiane', month: 'long', day: 'numeric' })
}
