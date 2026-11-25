-- 협력업체로 연결되지 않은 업체에도 예약 요청을 받을 수 있게 업체 정보를 함께 저장합니다.
-- 이미 있는 예약 데이터는 그대로이며, 새 열은 빈 값으로 채워집니다.
ALTER TABLE reservations ADD COLUMN business_id TEXT NOT NULL DEFAULT '';
ALTER TABLE reservations ADD COLUMN business_name TEXT NOT NULL DEFAULT '';
