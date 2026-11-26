# 라자(laja) 프로젝트 총정리

> 마지막 정리: 2026-11-26. 코드와 운영 상태가 바뀌면 이 문서도 함께 고쳐 주세요.
> 비밀 값(토큰, 웹훅 주소, 비밀번호)은 이 문서에도 코드에도 적지 않습니다.

## 1. 한눈에 보기

| 항목 | 내용 |
|---|---|
| 서비스 | **라자** — 라오스 자유 여행·생활 정보, 한인 업체 찾기, 환율, 커뮤니티 |
| 운영 주소 | https://laja.joybox.day (예전 주소 https://laos.joybox.day 도 연결됨) |
| 만든 방식 | Nuxt 4 + Nuxt UI 4 + Tailwind 4, 모바일 우선 (최대 폭 560px) |
| 서버 | Cloudflare Workers (이름 `laos-moa`), 정적 파일은 Worker 안에 포함 |
| 데이터베이스 | Cloudflare D1 `laos-moa` (이미지도 base64로 DB에 저장, R2 없음) |
| 디자인 | Nuxt UI 테마 빌더 설정: 주 색 orange, 중립 stone, 모서리 0.125rem, 글꼴 Bricolage Grotesque + Instrument Serif, 아이콘 Tabler |
| 알림 | Slack Incoming Webhook (Worker 비밀 값 `INQUIRY_WEBHOOK_URL`) |

## 2. 화면과 기능

### 이용자 화면 (누구나)
- **홈** `/` — 로고·검색, 지역·탭, 배너, 카테고리 8개, 환율 카드, 라자 추천 업체, 커뮤니티 새 글, 처음 오셨나요? 가이드, 바로가기
- **업체** `/businesses` — 지도+목록(지역·업종·정렬), 길찾기·전화·예약 요청 버튼, 행을 누르면 상세로 이동
- **업체 상세** `/businesses/[id]` — 사진, 정보, **연락처(로고 아이콘 한 줄, 누르면 아이디와 복사 버튼)**, 후기 개수와 쓰기, 소개, 구글 지도, 정보 수정 요청
- **환율** `/exchange` — 원·킵·달러 즉시 변환(실제 환율 API 값이 있을 때만 숫자 표시), 환전업체
- **가이드** `/guides`, `/guides/[slug]` — 6종(비자, 운전면허, 심카드, 병원·응급, 대사관, 은행·환전). 출처와 확인일 표시
- **커뮤니티** `/community`, `/community/[id]` — 후기·자유게시판·질문·정보꿀팁·동행모임. 누구나 읽기, 회원만 쓰기·댓글·좋아요·신고
- **약관·개인정보** `/terms`, `/privacy`

### 회원 전용
- **가입·로그인** `/signup`, `/login` (이메일+비밀번호, 실명·휴대폰·닉네임·성별 입력)
- **내 정보** `/me` — 등급 표시(회원 1~9등급은 활동 점수로 자동, 10등급은 관리자), 로그아웃, 탈퇴
- **예약 요청** `/reserve`, **광고·문의** `/advertise` — 로그인한 회원만
- **글쓰기** `/community/write`

### 관리자 `/admin` (비밀번호 로그인 또는 10등급 관리자 회원)
대시보드, 예약, 업체(사진·연락처·추천 표시·사장님 계정 연결), 협력업체, 회원(권한), 배너, **커뮤니티(신고 처리)**, 광고 문의, 설정(Slack 시험 알림, 비밀번호 변경)
- 관리자 회원은 마지막 로그인 후 12시간 안에만 관리자로 인정. 지나면 회원 로그인 화면으로 갔다가 로그인하면 관리자 화면으로 바로 복귀.

### 협력업체 `/partner/*`
별도 로그인(ID+접속 코드). 자기 예약만 확인·확정·거절·완료. 가입 신청은 `/partner/apply`(링크를 직접 전달)

## 3. 디자인 규칙

- **Nuxt UI 스킬 규칙을 따릅니다** (`skills/nuxt-ui`): `UApp`으로 감싸기, **의미 색만 사용**(`text-highlighted`, `text-muted`, `bg-default`, `bg-muted`, `border-default`, `text-primary`, `bg-primary`). 팔레트 색(`text-gray-500`)이나 임의 색상 코드를 새로 쓰지 않습니다.
- **테마**: `app/app.config.ts`(주 색 orange, 중립 stone, 버튼·입력 최소 높이 44px), `app/assets/css/main.css`(모서리, 글꼴, 색 단계).
- **접근성을 위한 한 단계 조정**: 주 색은 `oklch(0.515 0.195 38.4)`(orange-700보다 약간 진함), 보조 글자는 stone-600, 입력 테두리는 stone-500. 흰 글자 대비 4.5:1, 테두리 3:1을 지키기 위해서입니다.
- **컴포넌트**: 버튼은 `UButton`, 입력은 `UInput`·`UTextarea`. 선택 목록은 휴대폰 기본 선택창이 편해서 네이티브 `<select class="field">`를 씁니다.
- **글꼴**: 영문·숫자는 Bricolage Grotesque, 한글은 Pretendard, 큰 숫자와 영문 제목은 Instrument Serif(이탤릭 포함).
- **모서리**: 거의 직각(2~4px). 둥근 알약·원 모양을 새로 만들지 않습니다.
- **접근성 기준**: 터치 영역 44px 이상, 글자 대비 4.5:1, 입력 테두리 3:1, 화면 전환 시 제목으로 포커스, 본문 건너뛰기 링크.
- **아이콘**: 선 아이콘은 Tabler(`app/utils/tabler.ts`, `AppIcon`), 업종·가이드는 Microsoft Fluent Emoji 3D(MIT), SNS 로고는 Simple Icons(CC0, `SnsIcon`).
- 하단 메뉴 5개: 홈 / 업체 / **커뮤니티(가운데)** / 가이드 / 내 정보.
- 버튼은 입력이 비어 있어도 눌립니다. 첫 번째 문제만 한국어로 알려 주고 그 칸으로 커서를 옮깁니다. 문구는 해요체.

## 4. 데이터 구조 (D1)

테이블: `settings`, `partners`, `reservations`, `inquiries`, `rate_hits`(요청 횟수 제한), `businesses`, `members`, `business_photos`, `banners`, `community_posts`, `community_comments`, `community_likes`, `community_reports`
- 전체 정의는 `db/schema.sql`, 변경 이력은 `db/migrations/002~007`. **운영 DB에는 002~007 모두 적용됨.**
- 새 마이그레이션은 파일로 만들고 `wrangler d1 execute laos-moa --remote --yes --file=...`로 적용. **배포 승인과 함께** 실행합니다.
- 업체 연락처는 `businesses.contact` 한 칸에 저장: 옛 방식(글자 한 줄)과 새 방식(JSON 목록 `[{"t":"kakao","v":"id"}]`)을 둘 다 읽습니다. (`shared/utils/contact.ts`)
- 회원 등급은 저장하지 않고 읽을 때 계산합니다. (`server/utils/grade.ts`)
- 회원이 탈퇴하면 예약·문의 기록은 연결만 끊고 1년 보관, 커뮤니티 글·댓글은 "탈퇴한 회원"으로 남습니다.

## 5. 인증과 보안

- 비밀번호·접속 코드: PBKDF2 해시. 로그인 상태: 서명된 HttpOnly 쿠키(관리자 `laosmoa_session`, 회원 `laja_member` 30일).
- 다른 사이트에서 오는 요청 차단(origin 검사), 로그인·예약·문의·글쓰기 횟수 제한(`rate_hits`).
- 업로드 이미지는 파일 앞부분(JPEG/PNG/WebP)으로 검사, SVG 거부.
- 이메일은 아직 인증하지 않으므로 이메일만으로 관리자 권한을 주지 않습니다.
- Slack 웹훅은 `hooks.slack.com` 주소만 허용.
- 커뮤니티: 신고 3건이면 자동 숨김 + Slack 알림, 관리자가 복구·삭제.

## 6. 외부 서비스

| 용도 | 서비스 |
|---|---|
| 환율 | ExchangeRate-API (불러오지 못하면 숫자를 보여 주지 않음) |
| 지도 | OpenStreetMap + Leaflet(목록), 구글 지도 임베드(상세) |
| 알림 | Slack Incoming Webhook |
| 글꼴 | Pretendard 계열 시스템 글꼴(웹폰트 끔) |

## 7. 개발·배포 방법

```bash
npm install
npm run dev        # 개발 서버
npm run build      # 빌드 (.output)
```

**운영 배포** (Cloudflare 계정 환경변수 필요: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`)
```bash
npm run build
cd .output/server
# wrangler.json 에서 "assets" 항목을 뺀 배포용 설정을 만듭니다.
node -e "const c=require('./wrangler.json');delete c.assets;require('fs').writeFileSync('wrangler.deploy.json',JSON.stringify(c))"
npx wrangler deploy -c wrangler.deploy.json
```
- 서버 코드에서 상수(`BOARD_KEYS` 등)는 자동으로 불러오지 않으므로 `import`로 직접 불러옵니다.
- Worker 비밀 값: `SESSION_SECRET`(필수), `INQUIRY_WEBHOOK_URL`(Slack). 코드·저장소에 넣지 마세요.
- 배포 직후 몇 초는 새 파일이 404로 보일 수 있습니다.

**로컬 시험**: `wrangler dev --local -c wrangler.json --port 8788 --var SESSION_SECRET:...`(`.output/server`에서). 로컬 DB는 `db/schema.sql`로 만듭니다. 자동 시험 스크립트(회귀·접근성)는 2026-11-26에 **모두 삭제**했습니다. 저장소에 시험 코드는 없으므로, 기능을 바꿀 때는 화면을 직접 확인하고 필요하면 시험을 새로 만드세요.

## 8. 일하는 약속

1. **운영 배포는 사용자가 "운영에 배포해줘"라고 말할 때만** 합니다. DB 변경은 배포와 함께 적용.
2. 확인되지 않은 업체·전화번호·가격·후기를 지어내지 않습니다. 사이트에는 실제 등록 정보만 보입니다.
3. 제도·요금 정보는 출처와 확인일을 붙이고, 모르는 숫자는 적지 않습니다.
4. 비밀 값은 채팅에 붙여 넣지 않습니다. 필요한 값은 Cloudflare 설정에 직접 넣습니다.
5. 바꿀 때마다 화면과 접근성(축소 화면 360~430px, 글자 대비, 터치 44px)을 확인하고, 백업 브랜치에 올립니다.

## 9. 남은 일

- [ ] Cloudflare 토큰 교체 (예전 스크린샷에 노출된 적 있음)
- [ ] 개인정보 안내: 보관 기간(예약·문의 1년은 초안), 커뮤니티 글 익명 보관 문구 추가, 법률 검토
- [ ] 관리자 비밀번호 로그인을 끌지 결정(회원 관리자가 있음. 비상구 역할)
- [ ] 이메일 인증, 비밀번호 찾기 미구현
- [ ] 실제 업체 등록(마트·병원·환전·학원·렌트·구인은 비어 있음)
- [ ] VIP 마사지 소개 문구 정리(카카오톡 안내 줄, 영업시간)
- [ ] 커뮤니티 운영진 첫 글(이용 안내)
- [ ] 가이드 본문 검토(비자·운전면허·응급 번호는 출처 확인 필요)
- [ ] 목록 행 연락 버튼을 아이콘만으로 줄일지 결정
- [ ] (선택) 자동 시험이 필요해지면 `tests/`에 새로 작성
- [ ] 관리자·협력업체 화면을 흰색+파랑 디자인으로 맞추기

## 10. 폴더 구조

```
app/pages        화면 (홈, 업체, 가이드, 커뮤니티, 로그인…, admin/, partner/)
app/components   BottomNav, BusinessRow, ContactIcons, SnsIcon, PostCard, HomeBanner …
app/data         업종·가이드(본문)·커뮤니티 게시판·지역 정의
app/utils        시간, 이미지 줄이기, 업체 도우미
shared/utils     contact.ts (연락 방법 규칙: 화면과 서버가 같이 씀)
server/api       공개·회원·관리자·협력업체 API
server/utils     인증, 회원 등급, 업체 변환, 커뮤니티 도우미
db               schema.sql, migrations/
public           아이콘, 이모지, 가이드·업종 대표 이미지, 로고
docs             이 문서, 사업 구상서(business-plan.md)
```
