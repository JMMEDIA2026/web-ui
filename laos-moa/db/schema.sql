-- 라오스모아 D1 스키마
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
  updated_at TEXT NOT NULL
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
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS rate_hits (
  ip TEXT NOT NULL,
  kind TEXT NOT NULL,
  at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rate_hits ON rate_hits (ip, kind, at);
