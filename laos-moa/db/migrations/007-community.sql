-- 커뮤니티: 게시글·댓글·좋아요·신고
CREATE TABLE IF NOT EXISTS community_posts (
  id TEXT PRIMARY KEY,
  board TEXT NOT NULL,                 -- review / free / qna / tips / meet
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  member_id TEXT NOT NULL,
  business_id TEXT NOT NULL DEFAULT '', -- 후기: 어떤 업체에 대한 글인지 (선택)
  rating INTEGER NOT NULL DEFAULT 0,    -- 후기: 별점 1~5 (0이면 없음)
  like_count INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  report_count INTEGER NOT NULL DEFAULT 0,
  hidden INTEGER NOT NULL DEFAULT 0,    -- 1이면 목록·상세에서 숨김
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_cposts_board ON community_posts (hidden, board, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cposts_business ON community_posts (business_id, hidden, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cposts_member ON community_posts (member_id);

CREATE TABLE IF NOT EXISTS community_comments (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  body TEXT NOT NULL,
  report_count INTEGER NOT NULL DEFAULT 0,
  hidden INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ccomments_post ON community_comments (post_id, created_at);

CREATE TABLE IF NOT EXISTS community_likes (
  post_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (post_id, member_id)
);

CREATE TABLE IF NOT EXISTS community_reports (
  id TEXT PRIMARY KEY,
  target_type TEXT NOT NULL,           -- post / comment
  target_id TEXT NOT NULL,
  member_id TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  UNIQUE (target_type, target_id, member_id)
);
