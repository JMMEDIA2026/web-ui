# 라오스모아 (가칭)

라오스 한인을 위한 생활 정보 · 한인 업체 디렉토리 사이트입니다. Nuxt 4 + Nuxt UI 기본 디자인으로 만들었습니다.

> 이 폴더는 임시 보관용입니다. 별도 GitHub 저장소를 만들면 폴더째 옮겨 독립 프로젝트로 쓰세요.
> 이 저장소(Nuxt UI 라이브러리) 안에서는 루트의 `.nuxtrc`가 `@nuxt/content`를 강제로 불러와 빌드가 되지 않습니다.

## 실행

```bash
npm install
npm run dev      # 개발 서버
npm run build    # 빌드
```

## 구성

- `app/pages` 홈, 한인 업체(목록·상세), 생활 가이드(목록·상세), 광고 안내·문의
- `app/data` 업체·가이드 예시 데이터 (실제 정보로 교체 필요)
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

- 운영 주소: https://laos.joybox.day
- 한글 웹폰트는 용량 때문에 끄고 시스템 폰트를 씁니다. (`ui.fonts: false`)
