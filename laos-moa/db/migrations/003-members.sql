-- 회원 표와, 예약·문의가 어느 회원이 보낸 것인지 연결하는 열을 추가합니다.
-- 기존 데이터는 그대로이며 새 열은 빈 값으로 채워집니다.
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,            -- 소문자로 저장
  password_hash TEXT NOT NULL,           -- PBKDF2 해시 (원문은 저장하지 않음)
  nickname TEXT NOT NULL,
  real_name TEXT NOT NULL,
  phone TEXT NOT NULL,                   -- 숫자와 + 만 저장
  gender TEXT NOT NULL,                  -- M(남성) / F(여성) / N(선택 안 함)
  terms_at TEXT NOT NULL,                -- 이용약관 동의 시각
  privacy_at TEXT NOT NULL,              -- 개인정보 수집·이용 동의 시각
  created_at TEXT NOT NULL,
  last_login_at TEXT NOT NULL DEFAULT ''
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_members_nickname ON members (lower(nickname));
ALTER TABLE reservations ADD COLUMN member_id TEXT NOT NULL DEFAULT '';
ALTER TABLE inquiries ADD COLUMN member_id TEXT NOT NULL DEFAULT '';
