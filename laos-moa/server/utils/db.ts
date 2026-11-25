import type { H3Event } from 'h3'

// Cloudflare D1 최소 타입 (필요한 메서드만 정의)
export interface D1Result<T = Record<string, unknown>> {
  results: T[]
  success: boolean
  meta: Record<string, unknown>
}
export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
  first<T = Record<string, unknown>>(): Promise<T | null>
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>
  run(): Promise<D1Result>
}
export interface D1Database {
  prepare(sql: string): D1PreparedStatement
}

interface CfEnv {
  DB?: D1Database
  SESSION_SECRET?: string
  /** Slack 알림 주소(Incoming Webhook). Worker 비밀 값으로 저장합니다. */
  INQUIRY_WEBHOOK_URL?: string
}

export function cfEnv(event: H3Event): CfEnv {
  return ((event.context as { cloudflare?: { env?: CfEnv } }).cloudflare?.env ?? {}) as CfEnv
}

export function useDB(event: H3Event): D1Database {
  const db = cfEnv(event).DB
  if (!db) {
    throw createError({ statusCode: 503, statusMessage: '데이터베이스가 연결되지 않았습니다' })
  }
  return db
}

export const nowIso = () => new Date().toISOString()

// 헷갈리는 글자(0/O, 1/I/L)를 뺀 코드용 문자
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

export function randomCode(length: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(bytes, b => ALPHABET[b % ALPHABET.length]).join('')
}

// --- 요청 횟수 제한 (로그인 무차별 대입, 예약 스팸 방지) ---
export async function rateCount(db: D1Database, ip: string, kind: string, windowMs: number): Promise<number> {
  const since = Date.now() - windowMs
  const row = await db
    .prepare('SELECT COUNT(*) AS n FROM rate_hits WHERE ip = ? AND kind = ? AND at > ?')
    .bind(ip, kind, since)
    .first<{ n: number }>()
  return row?.n ?? 0
}

export async function rateAdd(db: D1Database, ip: string, kind: string): Promise<void> {
  await db.prepare('INSERT INTO rate_hits (ip, kind, at) VALUES (?, ?, ?)').bind(ip, kind, Date.now()).run()
  // 하루 지난 기록은 정리합니다.
  await db.prepare('DELETE FROM rate_hits WHERE at < ?').bind(Date.now() - 24 * 3600 * 1000).run()
}

export async function rateClear(db: D1Database, ip: string, kind: string): Promise<void> {
  await db.prepare('DELETE FROM rate_hits WHERE ip = ? AND kind = ?').bind(ip, kind).run()
}
