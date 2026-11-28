import type { H3Event } from 'h3'
import { MEMBERS_CATEGORY } from './constants'
import { isAdminRequest } from './community'

// "회원전용" 분야를 볼 수 있는 사람: 로그인한 회원(탈퇴한 회원의 쿠키는 제외) 또는 관리자.
export async function hasMemberAccess(event: H3Event): Promise<boolean> {
  if (await readMember(event)) return true
  return await isAdminRequest(event)
}

export async function requireMemberAccess(event: H3Event): Promise<void> {
  if (await hasMemberAccess(event)) return
  throw createError({ statusCode: 401, statusMessage: '회원 전용이에요. 로그인하거나 회원가입해 주세요' })
}

// 공개 목록 SQL 에서 회원전용 분야를 빼는 조건 (businesses 표에 붙인 별칭을 넘겨 주세요)
export const notMembersOnlySql = (alias = 'b') => `${alias}.category <> '${MEMBERS_CATEGORY}'`

// 회원전용 업체에 달린 글을 빼는 조건 (community_posts 표의 별칭 p)
export const postNotMembersOnlySql = `NOT EXISTS (SELECT 1 FROM businesses mb WHERE mb.id = p.business_id AND mb.category = '${MEMBERS_CATEGORY}')`
