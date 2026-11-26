-- 라자 D1 스키마
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS partners (
  id TEXT PRIMARY KEY,            -- 협력업체 로그인 ID (영문 소문자·숫자·하이픈)
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  contact TEXT NOT NULL DEFAULT '',
  code_hash TEXT NOT NULL,        -- 접속 코드의 PBKDF2 해시
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY,            -- 예약번호
  partner_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_contact TEXT NOT NULL,
  service TEXT NOT NULL DEFAULT '',
  reserve_date TEXT NOT NULL,
  people INTEGER NOT NULL DEFAULT 1,
  note TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  partner_memo TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  business_id TEXT NOT NULL DEFAULT '',   -- 예약 요청을 받은 업체(협력업체가 아니어도 저장)
  business_name TEXT NOT NULL DEFAULT '',
  member_id TEXT NOT NULL DEFAULT ''      -- 예약한 회원
);
CREATE INDEX IF NOT EXISTS idx_reservations_partner ON reservations (partner_id, created_at);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations (status, created_at);

CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  company TEXT NOT NULL,
  contact TEXT NOT NULL,
  product TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL,
  member_id TEXT NOT NULL DEFAULT ''      -- 문의한 회원
);

CREATE TABLE IF NOT EXISTS rate_hits (
  ip TEXT NOT NULL,
  kind TEXT NOT NULL,
  at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rate_hits ON rate_hits (ip, kind, at);

-- 지도·목록에 표시하는 업체. partner_id 는 나중에 사장님(협력업체) 계정과 연결할 때 채웁니다.
CREATE TABLE IF NOT EXISTS businesses (
  id TEXT PRIMARY KEY,            -- 주소용 ID (영문 소문자·숫자·하이픈)
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  area TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  lat REAL,
  lng REAL,
  description TEXT NOT NULL DEFAULT '',
  hours TEXT NOT NULL DEFAULT '',
  contact TEXT NOT NULL DEFAULT '',
  map_url TEXT NOT NULL DEFAULT '',
  partner_id TEXT,
  sponsored INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses (category, active);

-- 회원 (이메일 + 비밀번호). 실명·휴대폰은 예약 처리에 필요한 개인정보입니다.
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  nickname TEXT NOT NULL,
  real_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  gender TEXT NOT NULL,
  terms_at TEXT NOT NULL,
  privacy_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  last_login_at TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'member'      -- member / admin(10등급)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_members_nickname ON members (lower(nickname));

-- 업체 사진 (큰 사진·작은 사진을 base64로 저장, 대표 사진 1장)
CREATE TABLE IF NOT EXISTS business_photos (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  full_b64 TEXT NOT NULL,
  thumb_b64 TEXT NOT NULL,
  mime TEXT NOT NULL DEFAULT 'image/jpeg',
  is_cover INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_photos_business ON business_photos (business_id, is_cover DESC, sort_order, created_at);

-- 메인 배너(광고 슬라이드). 이미지는 base64 글자로 저장합니다. (브라우저에서 2:1로 잘라 줄여 올림)
CREATE TABLE IF NOT EXISTS banners (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,                    -- 관리용 이름 (이미지 설명으로도 씀)
  advertiser TEXT NOT NULL DEFAULT '',    -- 광고주 (관리자 화면에서만 보임)
  link_url TEXT NOT NULL DEFAULT '',      -- https://… 또는 /경로 (비우면 눌러도 이동 없음)
  image_b64 TEXT NOT NULL,
  mime TEXT NOT NULL DEFAULT 'image/jpeg',
  active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  starts_at TEXT NOT NULL DEFAULT '',     -- 비우면 바로 시작 (YYYY-MM-DD, 라오스 시간)
  ends_at TEXT NOT NULL DEFAULT '',       -- 비우면 계속 노출 (이 날짜까지 포함)
  clicks INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_banners_active ON banners (active, sort_order, created_at);

-- 커뮤니티 (db/migrations/007-community.sql 과 같은 내용)
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
