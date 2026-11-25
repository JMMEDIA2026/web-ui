import type { H3Event } from 'h3'
import { z } from 'zod'

const enc = new TextEncoder()
const COOKIE = 'laosmoa_session'
const SESSION_HOURS = 8
const PBKDF2_ITERATIONS = 100_000

const toHex = (buf: ArrayBuffer | Uint8Array) =>
  Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join('')
const fromHex = (hex: string) =>
  Uint8Array.from(hex.match(/.{2}/g) ?? [], h => Number.parseInt(h, 16))

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

// --- 비밀번호·접속 코드 해시 (PBKDF2-SHA256) ---
export async function hashSecret(secret: string, saltHex?: string, iterations = PBKDF2_ITERATIONS): Promise<string> {
  const salt = saltHex ? fromHex(saltHex) : crypto.getRandomValues(new Uint8Array(16))
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256)
  return `pbkdf2$${iterations}$${toHex(salt)}$${toHex(bits)}`
}

export async function verifySecret(secret: string, stored: string): Promise<boolean> {
  const [scheme, iterations, salt, hash] = stored.split('$')
  if (scheme !== 'pbkdf2' || !iterations || !salt || !hash) return false
  const calculated = await hashSecret(secret, salt, Number(iterations))
  return timingSafeEqual(calculated.split('$')[3] ?? '', hash)
}

// --- 서명된 세션 쿠키 ---
export interface Session {
  role: 'admin' | 'partner'
  pid?: string
  exp: number
}

const b64url = (buf: ArrayBuffer | Uint8Array) =>
  btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
const b64urlDecode = (s: string) => atob(s.replace(/-/g, '+').replace(/_/g, '/'))

async function sign(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return b64url(await crypto.subtle.sign('HMAC', key, enc.encode(data)))
}

function secretOf(event: H3Event): string {
  const secret = cfEnv(event).SESSION_SECRET
  if (!secret) {
    throw createError({ statusCode: 503, statusMessage: '서버 보안 설정이 완료되지 않았습니다' })
  }
  return secret
}

export async function startSession(event: H3Event, role: Session['role'], pid?: string): Promise<void> {
  const session: Session = { role, pid, exp: Date.now() + SESSION_HOURS * 3600 * 1000 }
  const payload = b64url(enc.encode(JSON.stringify(session)))
  const signature = await sign(secretOf(event), payload)
  setCookie(event, COOKIE, `${payload}.${signature}`, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_HOURS * 3600
  })
}

export function endSession(event: H3Event): void {
  deleteCookie(event, COOKIE, { path: '/' })
}

export async function readSession(event: H3Event): Promise<Session | null> {
  const raw = getCookie(event, COOKIE)
  if (!raw) return null
  const [payload, signature] = raw.split('.')
  if (!payload || !signature) return null
  const expected = await sign(secretOf(event), payload)
  if (!timingSafeEqual(expected, signature)) return null
  try {
    const session = JSON.parse(b64urlDecode(payload)) as Session
    if (!session.exp || session.exp < Date.now()) return null
    return session
  } catch {
    return null
  }
}

// 다른 사이트에서 보낸 요청(CSRF)을 막습니다.
export function assertSameOrigin(event: H3Event): void {
  const origin = getRequestHeader(event, 'origin')
  if (!origin) return
  let host = ''
  try {
    host = new URL(origin).host
  } catch {
    host = ''
  }
  if (host !== getRequestHost(event)) {
    throw createError({ statusCode: 403, statusMessage: '허용되지 않은 요청입니다' })
  }
}

export async function requireAdmin(event: H3Event): Promise<void> {
  if (event.method !== 'GET') assertSameOrigin(event)
  const session = await readSession(event)
  if (session?.role !== 'admin') {
    throw createError({ statusCode: 401, statusMessage: '로그인이 필요합니다' })
  }
}

export interface PartnerRow {
  id: string
  name: string
  category: string
  contact: string
  active: number
}

export async function requirePartner(event: H3Event): Promise<PartnerRow> {
  if (event.method !== 'GET') assertSameOrigin(event)
  const session = await readSession(event)
  if (session?.role !== 'partner' || !session.pid) {
    throw createError({ statusCode: 401, statusMessage: '로그인이 필요합니다' })
  }
  // 비활성화된 업체는 즉시 접근을 막습니다.
  const partner = await useDB(event)
    .prepare('SELECT id, name, category, contact, active FROM partners WHERE id = ?')
    .bind(session.pid)
    .first<PartnerRow>()
  if (!partner || !partner.active) {
    throw createError({ statusCode: 401, statusMessage: '로그인이 필요합니다' })
  }
  return partner
}

export function clientIp(event: H3Event): string {
  return getRequestHeader(event, 'cf-connecting-ip') || 'unknown'
}

export async function parseBody<T extends z.ZodTypeAny>(event: H3Event, schema: T): Promise<z.output<T>> {
  const raw = await readBody(event).catch(() => undefined)
  const result = schema.safeParse(raw)
  if (!result.success) {
    throw createError({ statusCode: 400, statusMessage: result.error.issues[0]?.message || '입력값이 올바르지 않습니다' })
  }
  return result.data
}

export async function notify(event: H3Event, text: string): Promise<void> {
  const webhook = useRuntimeConfig(event).inquiryWebhookUrl
  if (!webhook) {
    console.log(text)
    return
  }
  try {
    await $fetch(webhook as string, { method: 'POST', body: { text } })
  } catch (error) {
    console.error('[notify] webhook failed', error)
  }
}
