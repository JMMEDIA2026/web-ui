// 신고된 글·댓글 목록 (신고가 있거나 숨겨진 것)
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = useDB(event)
  const posts = await db
    .prepare(`SELECT p.id, p.board, p.title, p.body, p.hidden, p.report_count, p.created_at, m.nickname
      FROM community_posts p LEFT JOIN members m ON m.id = p.member_id
      WHERE p.report_count > 0 OR p.hidden = 1 ORDER BY p.report_count DESC, p.created_at DESC LIMIT 100`)
    .all<{ id: string, board: string, title: string, body: string, hidden: number, report_count: number, created_at: string, nickname: string | null }>()
  const comments = await db
    .prepare(`SELECT c.id, c.post_id, c.body, c.hidden, c.report_count, c.created_at, m.nickname
      FROM community_comments c LEFT JOIN members m ON m.id = c.member_id
      WHERE c.report_count > 0 OR c.hidden = 1 ORDER BY c.report_count DESC, c.created_at DESC LIMIT 100`)
    .all<{ id: string, post_id: string, body: string, hidden: number, report_count: number, created_at: string, nickname: string | null }>()
  return {
    posts: posts.results.map(p => ({ ...p, author: authorName(p.nickname), hidden: !!p.hidden })),
    comments: comments.results.map(c => ({ ...c, author: authorName(c.nickname), hidden: !!c.hidden }))
  }
})
