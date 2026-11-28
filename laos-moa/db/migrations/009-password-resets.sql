-- 비밀번호 재설정 코드. 코드 원문은 저장하지 않고 해시만 저장합니다. (30분 유효, 1회용, 5번 틀리면 폐기)
CREATE TABLE IF NOT EXISTS password_resets (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  used INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_password_resets_member ON password_resets (member_id, used, expires_at);
