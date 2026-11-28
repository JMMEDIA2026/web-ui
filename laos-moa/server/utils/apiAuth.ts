import type { H3Event } from 'h3'
import { readApiMemberToken, sha256Hex } from './auth'
import { nowIso, randomCode, rateAdd, rateCount, useDB } from './db'
import type { MemberRow } from './member'

// 외부 사이트에 줄 수 있는 권한. 키마다 필요한 것만 골라 발급합니다.
export const API_SCOPES = {
  'auth': '회원가입·로그인 (회원 토큰 발급)',
  'members:read': '회원 목록·상세 읽기 (실명·휴대폰 포함)',
  'businesses:read': '업체 목록·상세 읽기',
  'reservations:read': '예약 목록 읽기',
  'reservations:write': '회원 대신 예약 요청 만들기',
  'reservations:manage': '예약 처리: 상태 바꾸기·업체 메모 쓰기',
  'inquiries:read': '광고·정보 문의 목록 읽기',
  'inquiries:write': '회원 대신 문의 남기기',
  'content:read': '가이드·환율 읽기',
  'community:read': '커뮤니티 글·댓글 읽기',
  'community:write': '회원 대신 글·댓글 쓰기'
} as const
export type ApiScope = keyof typeof API_SCOPES
export const API_SCOPE_KEYS = Object.keys(API_SCOPES) as ApiScope[]

export interface ApiClient {
  id: string
  name: string
  scopes: ApiScope[]
  ratePerMin: number
}

const KEY_PREFIX = 'laja_'

// 키 원문은 발급 때 한 번만 보여 주고, DB에는 해시만 남깁니다.
export async function generateApiKey(): Promise<{ key: string, prefix: string, hash: string }> {
  const key = `${KEY_PREFIX}${randomCode(40)}`
  return { key, prefix: key.slice(0, 12), hash: await sha256Hex(key) }
}

function bearer(event: H3Event): string {
  const header = getRequestHeader(event, 'authorization') ?? ''
  const m = /^Bearer\s+(\S+)$/i.exec(header)
  return m?.[1] ?? ''
}

const unauthorized = () => createError({ statusCode: 401, statusMessage: 'API 키가 없거나 올바르지 않아요. Authorization: Bearer <키> 헤더를 확인해 주세요' })

// API 키를 확인하고, 필요한 권한이 있는지 보고, 분당 요청 횟수를 제한합니다.
export async function requireApiClient(event: H3Event, scope?: ApiScope): Promise<ApiClient> {
  const raw = bearer(event)
  if (!raw.startsWith(KEY_PREFIX) || raw.length > 100) throw unauthorized()

  const db = useDB(event)
  const row = await db
    .prepare('SELECT id, name, scopes, rate_per_min, active FROM api_clients WHERE key_hash = ?')
    .bind(await sha256Hex(raw))
    .first<{ id: string, name: string, scopes: string, rate_per_min: number, active: number }>()
  if (!row || !row.active) throw unauthorized()

  const client: ApiClient = {
    id: row.id,
    name: row.name,
    scopes: row.scopes.split(',').filter((s): s is ApiScope => s in API_SCOPES),
    ratePerMin: row.rate_per_min
  }

  // 분당 횟수 제한 (키마다)
  const who = `api:${client.id}`
  if (await rateCount(db, who, 'api', 60 * 1000) >= client.ratePerMin) {
    setResponseHeader(event, 'retry-after', '60')
    throw createError({ statusCode: 429, statusMessage: `요청이 너무 많아요. 이 키는 1분에 ${client.ratePerMin}번까지 쓸 수 있어요` })
  }
  await rateAdd(db, who, 'api')
  await db
    .prepare('UPDATE api_clients SET last_used_at = ?, request_count = request_count + 1 WHERE id = ?')
    .bind(nowIso(), client.id)
    .run()

  setResponseHeader(event, 'cache-control', 'private, no-store')
  if (scope && !client.scopes.includes(scope)) {
    throw createError({ statusCode: 403, statusMessage: `이 키에는 "${scope}" 권한이 없어요. 관리자 > API 에서 권한을 추가해 주세요` })
  }
  return client
}

// 회원 토큰(X-Member-Token)으로 "누구의 이름으로" 요청하는지 확인합니다.
// 토큰은 같은 API 키로 발급한 것만 인정하고, 탈퇴한 회원은 바로 막습니다.
export async function requireApiMember(event: H3Event, client: ApiClient): Promise<MemberRow> {
  const raw = getRequestHeader(event, 'x-member-token') ?? ''
  const info = raw ? await readApiMemberToken(event, raw) : null
  if (!info || info.clientId !== client.id) {
    throw createError({ statusCode: 401, statusMessage: '회원 로그인이 필요해요. X-Member-Token 헤더에 로그인으로 받은 토큰을 넣어 주세요' })
  }
  const member = await useDB(event)
    .prepare('SELECT id, email, nickname, real_name, phone, gender, created_at, role FROM members WHERE id = ?')
    .bind(info.memberId)
    .first<MemberRow>()
  if (!member) throw createError({ statusCode: 401, statusMessage: '회원 정보를 찾을 수 없어요. 다시 로그인해 주세요' })
  return member
}

// 목록 API 공통: limit(최대 200)·offset 검사
export function pageParams(event: H3Event): { limit: number, offset: number } {
  const q = getQuery(event)
  const limit = Math.min(200, Math.max(1, Number.parseInt(String(q.limit ?? '50'), 10) || 50))
  const offset = Math.max(0, Number.parseInt(String(q.offset ?? '0'), 10) || 0)
  return { limit, offset }
}
