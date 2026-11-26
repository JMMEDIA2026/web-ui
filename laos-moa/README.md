# 라자 (laja)

라오스 자유 여행·생활 정보, 한인 업체 찾기, 환율, 커뮤니티 사이트입니다. Nuxt 4 + Nuxt UI + Tailwind, Cloudflare Workers + D1.

**전체 구조·기능·규칙·남은 일은 [docs/PROJECT.md](docs/PROJECT.md)에 정리돼 있습니다.** (이 README는 요약입니다.)

> 이 폴더는 임시 보관용입니다. 별도 GitHub 저장소를 만들면 폴더째 옮겨 독립 프로젝트로 쓰세요.
> 이 저장소(Nuxt UI 라이브러리) 안에서는 루트의 `.nuxtrc`가 `@nuxt/content`를 강제로 불러와 빌드가 되지 않습니다.

## 실행

```bash
npm install
npm run dev      # 개발 서버
npm run build    # 빌드
```

## 구성

- `app/pages` 홈, 업체(목록·상세), 가이드, 커뮤니티, 환율, 로그인·가입·내 정보, 예약, 광고 문의, admin/, partner/
- `app/data` 업종·가이드 본문·커뮤니티 게시판 정의 (업체는 DB에서 불러옴)
- `server/api/inquiry.post.ts` 광고 문의 접수. `NUXT_INQUIRY_WEBHOOK_URL` 환경변수에 슬랙 웹훅을 넣으면 알림으로 전달

## 이미지 출처

- 사진: Jakub Hałun(메콩 석양, 탓루앙), Gerd Eichmann(빠뚜싸이), Wikimedia Commons, CC BY-SA 4.0
- 3D 이모티콘: Microsoft Fluent Emoji, MIT 라이선스

## 배포 (Cloudflare Workers)

```bash
npm run build
# .output/server/wrangler.json 에서 "assets" 항목을 뺀 배포용 설정을 만들어 배포합니다.
# (정적 파일은 serveStatic: 'inline' 으로 Worker 안에 포함됩니다.)
npx wrangler deploy --config .output/server/wrangler.deploy.json
```

- 운영 주소: https://laja.joybox.day (예전 주소 https://laos.joybox.day 도 연결됨)
- 한글 웹폰트는 용량 때문에 끄고 시스템 폰트를 씁니다. (`ui.fonts: false`)

## 관리자·협력업체·예약 (Cloudflare D1)

- 관리자: `/admin/login` (비밀번호) 또는 10등급 관리자 회원 — 대시보드, 예약, 업체, 협력업체, 회원, 배너, 커뮤니티, 광고 문의, 설정
- 협력업체: `/partner/login` (로그인 ID + 접속 코드) — 자기 예약만 확인·확정·거절·완료 처리
- 고객 예약: `/reserve` — 예약 요청을 보내면 해당 협력업체와 관리자 화면에 표시
- 저장소: Cloudflare D1 `laos-moa` (테이블은 `db/schema.sql`, 변경 이력은 `db/migrations/`)
- 보안: 비밀번호·접속 코드는 PBKDF2로 해시 저장, 세션은 서명된 HttpOnly 쿠키, 로그인 횟수 제한, 다른 사이트 요청(CSRF) 차단
- Worker 비밀 값 `SESSION_SECRET`(세션 서명 키)이 필요합니다. 코드나 저장소에 넣지 마세요.
- 관리자 비밀번호는 DB의 `settings.admin_password`에 해시로 들어 있습니다. 처음 받은 비밀번호는 `/admin/settings`에서 바꾸세요.
