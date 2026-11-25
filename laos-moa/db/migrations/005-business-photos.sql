-- 업체 사진. 큰 사진(full)과 작은 사진(thumb)을 base64 글자로 저장합니다.
-- 브라우저에서 줄여 올리므로 한 장이 보통 100~400KB 이하입니다.
CREATE TABLE IF NOT EXISTS business_photos (
  id TEXT PRIMARY KEY,
  business_id TEXT NOT NULL,
  full_b64 TEXT NOT NULL,
  thumb_b64 TEXT NOT NULL,
  mime TEXT NOT NULL DEFAULT 'image/jpeg',
  is_cover INTEGER NOT NULL DEFAULT 0,   -- 1이면 대표(썸네일) 사진
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_photos_business ON business_photos (business_id, is_cover DESC, sort_order, created_at);
