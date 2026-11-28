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
