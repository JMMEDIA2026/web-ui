-- 외부 사이트용 API 키 (관리자 > API 에서 발급). 키 원문은 저장하지 않고 SHA-256 해시만 저장합니다.
CREATE TABLE IF NOT EXISTS api_clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,                       -- 사이트 이름 (관리용)
  key_prefix TEXT NOT NULL,                 -- 키 앞 12글자 (목록에서 어떤 키인지 알아보는 용도)
  key_hash TEXT NOT NULL UNIQUE,            -- SHA-256(키 원문)
  scopes TEXT NOT NULL DEFAULT '',          -- 쉼표로 구분한 권한 목록
  rate_per_min INTEGER NOT NULL DEFAULT 120,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  last_used_at TEXT NOT NULL DEFAULT '',
  request_count INTEGER NOT NULL DEFAULT 0
);

-- 어느 사이트(API 키)로 가입했는지 기록 (라자에서 직접 가입하면 빈 값)
ALTER TABLE members ADD COLUMN signup_client TEXT NOT NULL DEFAULT '';
