import type { H3Event } from 'h3'

// 게시판 목록. 화면(app/data/community.ts)의 key와 같게 유지하세요.
export const BOARD_KEYS = ['review', 'free', 'qna', 'tips', 'meet'] as const
export type BoardKey = (typeof BOARD_KEYS)[number]

// 신고가 이만큼 쌓이면 운영자가 확인할 때까지 자동으로 숨깁니다.
export const AUTO_HIDE_REPORTS = 3

// 관리자 권한(비밀번호 로그인 또는 10등급 관리자 회원)이 있는 요청인지 확인합니다.
export async function isAdminRequest(event: H3Event): Promise<boolean> {
  try {
    await requireAdmin(event)
    return true
  } catch {
    return false
  }
}

export interface PostRow {
  id: string
  board: string
  title: string
  body: string
  member_id: string
  nickname: string | null
  author_role: string | null
  business_id: string
  business_name: string | null
  rating: number
  like_count: number
  comment_count: number
  hidden: number
  created_at: string
}

export const POST_SELECT = `
  p.id, p.board, p.title, p.body, p.member_id, m.nickname, m.role AS author_role,
  p.business_id, b.name AS business_name, p.rating, p.like_count, p.comment_count, p.hidden, p.created_at
  FROM community_posts p
  LEFT JOIN members m ON m.id = p.member_id
  LEFT JOIN businesses b ON b.id = p.business_id
`

// 탈퇴한 회원의 글은 "탈퇴한 회원"으로 보입니다.
export const authorName = (nickname: string | null) => nickname ?? '탈퇴한 회원'

export const publicPost = (r: PostRow, viewerId: string | null, withBody = true) => ({
  id: r.id,
  board: r.board,
  title: r.title,
  ...(withBody ? { body: r.body } : { excerpt: r.body.replace(/\s+/g, ' ').slice(0, 90) }),
  author: authorName(r.nickname),
  authorIsAdmin: r.author_role === 'admin',
  mine: !!viewerId && r.member_id === viewerId,
  businessId: r.business_id,
  businessName: r.business_name,
  rating: r.rating,
  likeCount: r.like_count,
  commentCount: r.comment_count,
  createdAt: r.created_at
})
