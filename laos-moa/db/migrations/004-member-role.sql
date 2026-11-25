-- 회원 권한: member(일반 회원) / admin(10등급 관리자)
-- 기존 회원은 모두 member로 채워집니다.
ALTER TABLE members ADD COLUMN role TEXT NOT NULL DEFAULT 'member';
