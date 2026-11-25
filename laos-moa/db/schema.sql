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
