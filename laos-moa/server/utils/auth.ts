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
    throw createError({ statusCode: 503, statusMessage: '지금은 이용할 수 없어요. 잠시 후 다시 시도해 주세요' })
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

// --- 회원 세션 (관리자·협력업체와 별도 쿠키) ---
const MEMBER_COOKIE = 'laja_member'
const MEMBER_DAYS = 30

export async function startMemberSession(event: H3Event, memberId: string): Promise<void> {
  const payload = b64url(enc.encode(JSON.stringify({ mid: memberId, exp: Date.now() + MEMBER_DAYS * 86400 * 1000 })))
  const signature = await sign(secretOf(event), payload)
  setCookie(event, MEMBER_COOKIE, `${payload}.${signature}`, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: MEMBER_DAYS * 86400
  })
}

export function endMemberSession(event: H3Event): void {
  deleteCookie(event, MEMBER_COOKIE, { path: '/' })
}

export async function readMemberId(event: H3Event): Promise<string | null> {
  const raw = getCookie(event, MEMBER_COOKIE)
  if (!raw) return null
  const [payload, signature] = raw.split('.')
  if (!payload || !signature) return null
  const expected = await sign(secretOf(event), payload)
  if (!timingSafeEqual(expected, signature)) return null
  try {
    const data = JSON.parse(b64urlDecode(payload)) as { mid?: string, exp?: number }
    if (!data.mid || !data.exp || data.exp < Date.now()) return null
    return data.mid
  } catch {
    return null
  }
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
    throw createError({ statusCode: 403, statusMessage: '요청을 처리할 수 없어요. 페이지를 새로고침한 뒤 다시 시도해 주세요' })
  }
}

export async function requireAdmin(event: H3Event): Promise<void> {
  if (event.method !== 'GET') assertSameOrigin(event)
  const session = await readSession(event)
  if (session?.role === 'admin') return

  // 10등급 관리자 회원: 관리자 권한은 최근 12시간 안에 로그인한 경우에만 인정합니다.
  const memberId = await readMemberId(event)
  if (memberId) {
    const row = await useDB(event)
      .prepare('SELECT role, last_login_at FROM members WHERE id = ?')
      .bind(memberId)
      .first<{ role: string, last_login_at: string }>()
    const recent = row?.last_login_at ? Date.now() - Date.parse(row.last_login_at) < 12 * 3600 * 1000 : false
    if (row?.role === 'admin' && recent) return
  }
  throw createError({ statusCode: 401, statusMessage: '로그인이 필요해요' })
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
    throw createError({ statusCode: 401, statusMessage: '로그인이 필요해요' })
  }
  // 비활성화된 업체는 즉시 접근을 막습니다.
  const partner = await useDB(event)
    .prepare('SELECT id, name, category, contact, active FROM partners WHERE id = ?')
    .bind(session.pid)
    .first<PartnerRow>()
  if (!partner || !partner.active) {
    throw createError({ statusCode: 401, statusMessage: '로그인이 필요해요' })
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
    throw createError({ statusCode: 400, statusMessage: result.error.issues[0]?.message || '입력한 내용을 다시 확인해 주세요' })
  }
  return result.data
}

// Slack 알림 주소: Worker 비밀 값(INQUIRY_WEBHOOK_URL)을 우선 쓰고, 없으면 환경변수 설정을 씁니다.
export function webhookUrlOf(event: H3Event): string {
  const raw = cfEnv(event).INQUIRY_WEBHOOK_URL || (useRuntimeConfig(event).inquiryWebhookUrl as string) || ''
  return String(raw).trim()
}

// 알림을 보내고 결과를 돌려줍니다. 주소가 없으면 로그에만 남깁니다.
export async function sendWebhook(event: H3Event, text: string): Promise<{ configured: boolean, ok: boolean }> {
  const webhook = webhookUrlOf(event)
  if (!webhook) {
    console.log(text)
    return { configured: false, ok: false }
  }
  // 임의의 주소로 요청을 보내지 않도록 Slack 주소만 허용합니다.
  if (!/^https:\/\/hooks\.slack\.com\/(services|workflows)\//.test(webhook)) {
    console.error('[notify] Slack 주소가 아니어서 보내지 않았습니다')
    return { configured: true, ok: false }
  }
  try {
    await $fetch(webhook, { method: 'POST', body: { text } })
    return { configured: true, ok: true }
  } catch (error) {
    console.error('[notify] webhook failed', error)
    return { configured: true, ok: false }
  }
}

export async function notify(event: H3Event, text: string): Promise<void> {
  await sendWebhook(event, text)
}
