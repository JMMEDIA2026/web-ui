// 커뮤니티 게시판. 서버(server/utils/community.ts)의 BOARD_KEYS와 같게 유지하세요.
export interface Board {
  key: 'review' | 'free' | 'qna' | 'tips' | 'meet'
  label: string
  emoji: string
  desc: string
  placeholder: string
}

export const boards: Board[] = [
  { key: 'review', label: '후기', emoji: '⭐', desc: '다녀온 곳과 써 본 서비스 이야기', placeholder: '어디를 어떻게 이용했는지, 좋았던 점과 아쉬운 점을 적어 주세요.' },
  { key: 'free', label: '자유게시판', emoji: '💬', desc: '라오스 생활 이야기를 편하게', placeholder: '하고 싶은 이야기를 편하게 적어 주세요.' },
  { key: 'qna', label: '질문·답변', emoji: '🙋', desc: '궁금한 건 여기서 물어보세요', placeholder: '궁금한 점을 구체적으로 적어 주세요. (언제, 어디서, 무엇이 필요한지)' },
  { key: 'tips', label: '정보·꿀팁', emoji: '💡', desc: '알아 두면 좋은 생활 정보', placeholder: '알려 주고 싶은 정보를 적어 주세요. 언제 확인한 내용인지 함께 적으면 좋아요.' },
  { key: 'meet', label: '동행·모임', emoji: '🤝', desc: '같이 다닐 사람, 모임 만들기', placeholder: '일정, 장소, 모이는 인원을 적어 주세요. 개인 연락처는 댓글이나 글에 공개하지 않는 게 안전해요.' }
]

export const boardMap = Object.fromEntries(boards.map(b => [b.key, b])) as Record<Board['key'], Board>

export interface PostListItem {
  id: string
  board: Board['key']
  title: string
  excerpt: string
  author: string
  authorIsAdmin: boolean
  mine: boolean
  businessId: string
  businessName: string | null
  rating: number
  likeCount: number
  commentCount: number
  createdAt: string
}
