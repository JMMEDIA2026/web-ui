# 라자 외부 연동 API 가이드 (v1)

다른 사이트가 **같은 DB를 쓰면서** 회원가입·로그인·업체·예약·문의·커뮤니티 자료를 이용하도록 하는 API입니다.
운영 중이며(2026-11-27 배포), 키는 **관리자 > API** 화면에서 발급·중지·삭제합니다.

- 기본 주소: `https://laja.joybox.day/api/v1`
- 형식: 요청·응답 모두 JSON (`Content-Type: application/json`)
- 시간: ISO 8601 UTC 문자열 (예: `2026-11-27T03:42:39.502Z`)
- 관련 문서: DB 구조는 [DATABASE.md](./DATABASE.md), 프로젝트 전체는 [PROJECT.md](./PROJECT.md)

---

## 1. 연동 전에 꼭 알아둘 것

1. **API 키는 다른 사이트의 서버에만** 두세요. 브라우저(프론트 코드)에 넣으면 누구나 훔쳐 갑니다.
   → 다른 사이트의 서버(Nuxt `server/api`, Cloudflare Worker, Node 서버 등)가 라자 API를 대신 호출하는 구조로 만드세요.
2. 키는 만들 때 **딱 한 번만** 보입니다. DB에는 SHA-256 해시만 저장하므로 라자도 원문을 모릅니다. 잃어버리면 새로 발급하세요.
3. **필요한 권한(scope)만** 주세요. 특히 `members:read`는 실명·휴대폰이 나갑니다.
4. 비밀번호 해시와 이미지 원본(base64)은 어떤 API로도 나가지 않습니다.
5. **회원은 사이트 구분 없이 하나**입니다. 어느 사이트에서 가입해도 같은 이메일·비밀번호로 라자에서도 로그인됩니다.
6. 약관·개인정보 처리방침에 "여러 사이트에서 회원 정보를 함께 쓴다"는 문구가 필요합니다(법률 검토 권장). 다른 사이트 가입 화면에서도 같은 동의를 받으세요.

---

## 2. 빠른 시작 (5분)

1. 관리자로 로그인 → **관리자 > API** → "새 키 만들기"
   - 사이트 이름 입력, 권한 선택(처음엔 `auth`만 권장), 분당 요청 횟수(기본 120)
2. 나온 키(`laja_…`)를 복사해서 다른 사이트 서버의 환경변수에 저장 (예: `LAJA_API_KEY`)
3. 키 확인:
   ```bash
   curl https://laja.joybox.day/api/v1/ping -H "Authorization: Bearer $LAJA_API_KEY"
   ```
   ```json
   { "ok": true, "client": { "id": "K…", "name": "내 사이트", "scopes": ["auth"], "ratePerMin": 120 }, "time": "…" }
   ```
4. 회원가입/로그인을 연결 → 필요한 권한을 하나씩 추가

---

## 3. 인증 방식

| 헤더 | 값 | 필요한 요청 |
|------|----|-------------|
| `Authorization` | `Bearer laja_XXXXXXXX…` | **모든** 요청 |
| `X-Member-Token` | 로그인·가입 응답의 `token` | "회원 이름으로" 하는 요청: `/auth/me`, 예약·문의·글·댓글 작성 |

- **API 키**: 사이트(서버)를 증명합니다. `laja_`로 시작, 총 45자. 중지·삭제하면 즉시 막힙니다.
- **회원 토큰**: 로그인한 회원을 증명합니다. `lm1.…` 형식, **30일** 유효, 서명(HMAC)으로 위조 방지.
  - **그 토큰을 발급한 키로만** 쓸 수 있습니다(다른 키로 쓰면 401).
  - 회원이 탈퇴하면 즉시 무효입니다.
  - 토큰을 서버에서 `httpOnly` 쿠키로 보관하세요. 로그아웃은 쿠키를 지우면 됩니다.

---

## 4. 권한(scope)

| scope | 할 수 있는 일 | 민감도 |
|-------|---------------|--------|
| `auth` | 회원가입, 로그인, 토큰 확인 | 보통 |
| `members:read` | 회원 목록·상세 (이메일·실명·휴대폰 포함) | **높음** |
| `businesses:read` | 업체 목록·상세 | 낮음 |
| `reservations:read` | 예약 목록 (고객 이름·연락처 포함) | 높음 |
| `reservations:write` | 회원 대신 예약 요청 만들기 | 보통 |
| `inquiries:read` | 광고·정보 문의 목록 (연락처 포함) | 높음 |
| `inquiries:write` | 회원 대신 문의 남기기 | 보통 |
| `community:read` | 글·댓글 읽기 | 낮음 |
| `community:write` | 회원 대신 글·댓글 쓰기 | 보통 |

권한이 없는 요청은 `403`입니다. 권한은 **관리자 > API**에서 새 키를 만들 때 정하며, 바꾸려면 새 키를 발급하세요.

---

## 5. 공통 규칙

### 5.1 목록·페이지 나누기
목록 API는 모두 아래 쿼리와 응답 모양을 씁니다.

| 쿼리 | 설명 | 기본값 |
|------|------|--------|
| `limit` | 한 번에 가져올 개수 (1~200) | 50 |
| `offset` | 건너뛸 개수 | 0 |

```json
{ "total": 123, "limit": 50, "offset": 0, "items": [ … ] }
```
**전체 가져오기**: `offset`을 `limit`씩 늘리며 `offset >= total`이 될 때까지 반복합니다.
**증분 동기화**: 회원·예약·문의는 `since=<ISO 시각>`으로 그 이후 생성분만 받을 수 있습니다.

### 5.2 오류 응답
```json
{ "error": true, "url": "…", "statusCode": 401, "statusMessage": "사람이 읽는 설명", "message": "같은 설명" }
```
화면에 그대로 보여 줘도 되는 한국어 문장입니다.

| 코드 | 의미 | 대처 |
|------|------|------|
| 400 | 입력값 오류 (첫 번째 문제만 알려 줌) | 입력 보완 후 재시도 |
| 401 | 키 없음/틀림/중지, 또는 회원 토큰 없음/만료/다른 키 발급 | 키 확인, 회원 재로그인 |
| 403 | 이 키에 필요한 권한 없음 | 권한을 가진 새 키 발급 |
| 404 | 대상 없음 | id 확인 |
| 409 | 이메일·닉네임 중복 | 다른 값 안내 |
| 429 | 횟수 초과 | `Retry-After` 초 뒤 재시도 |
| 503 | DB 연결/설정 문제 | 잠시 후 재시도, 계속되면 관리자에게 알림 |

### 5.3 횟수 제한
| 대상 | 한도 |
|------|------|
| 키 전체 요청 | 분당 `ratePerMin` (기본 120, 10~1200) |
| 가입 (`/auth/signup`) | 키당 1시간 30명 |
| 로그인 실패 | 같은 이메일 10분 8번 (어느 사이트에서 틀려도 합산) |
| 비밀번호 찾기 코드 요청 | 같은 이메일 1시간 3번, 키당 1시간 60번 |
| 비밀번호 재설정 시도 | 같은 이메일 10분 10번 (코드는 5번 틀리면 폐기) |
| 비밀번호 변경 | 회원당 10분 5번 |
| 예약 작성 | 회원당 1시간 10건 |
| 문의 작성 | 회원당 1시간 5건 |
| 글 작성 | 회원당 10분 5개 |
| 댓글 작성 | 회원당 10분 20개 |

### 5.4 캐시
모든 `/api/v1/**` 응답은 `Cache-Control: private, no-store`입니다. 응답을 서버 쪽에서 캐시하려면 다른 사이트가 직접 하세요.

---

## 6. 엔드포인트 상세

### 6.1 `GET /ping` — 키 확인
권한 불필요. 키가 정상인지, 어떤 권한이 있는지 확인합니다. (요청 횟수에는 포함됩니다.)

### 6.2 회원 (`auth`)

#### `POST /auth/signup` → `201`
요청:
```json
{
  "email": "user@example.com",
  "password": "abcd1234",
  "nickname": "라오스러버",
  "realName": "홍길동",
  "phone": "010-1234-5678",
  "gender": "M",
  "agreeTerms": true,
  "agreePrivacy": true
}
```
| 필드 | 규칙 |
|------|------|
| `email` | 이메일 형식, 120자 이하, 소문자로 저장 |
| `password` | 8~64자, 영문과 숫자 모두 포함 |
| `nickname` | 2~12자, 한글·영문·숫자·`_`만, 대소문자 구분 없이 중복 불가 |
| `realName` | 2~30자, 글자만 |
| `phone` | 숫자 8~15자 (`+` 허용, 공백·`-`·`()`·`.`은 자동 제거) |
| `gender` | `M` 남 / `F` 여 / `N` 선택 안 함 |
| `agreeTerms`, `agreePrivacy` | 반드시 `true` (회원이 실제 동의한 경우에만) |

응답:
```json
{
  "member": {
    "id": "MW8DYB2B573", "email": "user@example.com", "nickname": "라오스러버",
    "realName": "홍길동", "phone": "01012345678", "gender": "M", "role": "member",
    "createdAt": "2026-11-27T03:42:39.502Z",
    "grade": { "level": 1, "name": "새싹", "score": 0, "next": { "level": 2, "name": "새내기", "min": 5, "remaining": 5 } }
  },
  "token": "lm1.eyJ…",
  "expiresAt": "2026-12-27T03:42:39.502Z"
}
```
오류: `409` 이메일/닉네임 중복, `400` 규칙 위반, `429` 가입 과다.

#### `POST /auth/login`
```json
{ "email": "user@example.com", "password": "abcd1234" }
```
응답은 가입과 같습니다(`member`, `token`, `expiresAt`). 틀리면 `401`(이메일 존재 여부는 알려 주지 않음), 8번 틀리면 `429`.

#### `GET /auth/me`  (+ `X-Member-Token`)
토큰이 유효한지 확인하고 최신 회원 정보·등급을 `{ "member": {…} }`로 돌려줍니다. 페이지를 열 때마다 호출해도 됩니다.

> 등급은 활동 점수로 자동 계산됩니다(가입 후 7일마다 1점, 예약 요청 10점, 문의 5점, 취소·거절된 예약은 제외). `role: "admin"`이면 10등급(관리자)입니다.

#### 비밀번호 찾기 · 변경 (`auth`)

**1단계 `POST /auth/password/forgot`** — 가입한 이메일로 재설정 코드(8자)를 보냅니다.
```json
{ "email": "user@example.com" }
```
응답: `{ "ok": true, "message": "가입된 이메일이라면 …", "expiresInMinutes": 30 }`
- 가입된 이메일이든 아니든 **같은 응답**을 줍니다(가입 여부를 알아내지 못하게). 화면에도 "가입된 이메일이라면 보냈어요"처럼 안내하세요.
- 코드는 30분 유효, 1회용이며 새로 요청하면 이전 코드는 폐기됩니다.
- 같은 이메일로 1시간에 3번, 한 키로 1시간에 60번까지. 초과하면 `429`.
- 이메일 발송이 설정되지 않았으면 `503`입니다. (12번 "이메일 발송 설정" 참고)

**2단계 `POST /auth/password/reset`** — 메일로 받은 코드와 새 비밀번호를 보냅니다.
```json
{ "email": "user@example.com", "code": "6DKHM34M", "newPassword": "newpass99" }
```
- `code`는 대소문자 구분 없이 8자리, `newPassword`는 가입과 같은 규칙(8~64자, 영문+숫자).
- 코드가 틀렸거나 만료·사용됨이면 모두 같은 `400`(이유를 구분해 주지 않음). **5번 틀리면 그 코드는 폐기**되고, 같은 이메일로 10분에 10번까지만 시도할 수 있습니다.
- 성공하면 비밀번호가 바뀌고 모든 코드가 폐기됩니다. 로그인 실패 잠금도 풀립니다.

**`POST /auth/password/change`** (+ `X-Member-Token`) — 로그인한 회원이 비밀번호를 바꿉니다.
```json
{ "currentPassword": "newpass99", "newPassword": "third1234" }
```
현재 비밀번호가 틀리면 `400`(회원당 10분 5번까지).

> 비밀번호를 바꿔도 **이미 발급된 회원 토큰은 만료일(30일)까지 유효**합니다. 보안상 걱정되면 다른 사이트에서 비밀번호 변경·재설정 직후 토큰 쿠키를 지우고 다시 로그인시키세요.

### 6.3 회원 목록 (`members:read`)
- `GET /members?q=검색어&since=2026-01-01T00:00:00Z&limit=50&offset=0`
  - `q`: 닉네임·이메일·실명·휴대폰 부분 검색
- `GET /members/{id}` → `{ "member": {…, "grade": {…}} }`

목록 항목:
```json
{ "id": "M…", "email": "…", "nickname": "…", "realName": "…", "phone": "…", "gender": "F",
  "role": "member", "createdAt": "…", "lastLoginAt": "…", "signupClient": "K2ZV8BRCJ",
  "grade": { "level": 1, "name": "새싹", "score": 0 } }
```
`signupClient`는 가입에 쓴 API 키 id이고, 라자 사이트에서 직접 가입했으면 `null`입니다.

### 6.4 업체 (`businesses:read`)
- `GET /businesses?category=food&includeInactive=1&limit=50&offset=0`
- `GET /businesses/{id}` → `{ "business": {…} }`

| 필드 | 설명 |
|------|------|
| `slug` | 업체 id (주소용) |
| `name`, `category`, `area`, `address`, `description`, `hours`, `mapUrl` | 기본 정보 |
| `lat`, `lng` | 좌표 (없으면 `null`) |
| `contact` | 연락처. 새 형식은 JSON 문자열 `[{"t":"kakao","v":"id"}]` (t: phone·kakao·wechat·telegram·whatsapp·line 등), 옛 형식은 한 줄 글 |
| `sponsored` | 추천(광고) 업체 여부 |
| `photos` | 사진 id 배열 (맨 앞이 대표 사진) |
| `partnerId` | 연결된 협력업체 id (예약 직접 전달 가능 여부) |
| `active` | 노출 여부 (`includeInactive=1`일 때만 비노출 업체 포함) |

분류(`category`): `food` 식당 · `mart` 마트 · `exchange` 환전 · `massage` 마사지 · `hospital` 병원 · `school` 학교 · `rent` 렌트 · `job` 구인.
사진 이미지: `https://laja.joybox.day/api/photos/{사진id}`

### 6.5 예약
- `GET /reservations?status=pending&memberId=M…&since=…` (`reservations:read`)
  - 상태: `pending` 대기 · `confirmed` 확정 · `declined` 거절 · `completed` 완료 · `cancelled` 취소
- `POST /reservations` → `201` (`reservations:write` + `X-Member-Token`)
```json
{ "businessId": "업체id", "name": "홍길동", "contact": "카톡 abc123", "service": "", "date": "2026-12-25", "people": 2, "note": "" }
```
  - `date`는 `YYYY-MM-DD`, 라오스 시간 기준 어제보다 이전이면 400
  - `people` 1~100, `note` 1000자 이하, 업체가 없거나 비노출이면 404
  - 응답: `{ "ok": true, "id": "R2M6JJNU" }` — 처리는 라자 관리자(또는 연결된 협력업체)가 합니다.

목록 항목: `id, businessId, businessName, partnerId, memberId, customerName, customerContact, service, date, people, note, status, createdAt, updatedAt`

### 6.6 문의
- `GET /inquiries?status=new&memberId=…&since=…` (`inquiries:read`) — 상태 `new` 새 문의 · `done` 처리 완료
- `POST /inquiries` → `201` (`inquiries:write` + `X-Member-Token`)
```json
{ "company": "업체명", "contact": "카톡 abc123", "product": "free", "message": "" }
```
  - `product`: `free` 무료 등록 · `premium` 추천(광고) · `banner` 배너 · `correction` 정보 수정 · `etc` 제휴·기타
  - `message` 2000자 이하. 응답: `{ "ok": true, "id": "Q5ZBG9H" }`

목록 항목: `id, company, contact, product, message, status, memberId, createdAt`

### 6.7 커뮤니티
게시판(`board`): `review` 후기 · `free` 자유 · `qna` 질문 · `tips` 팁 · `meet` 모임

- `GET /community/posts?board=review&business=업체id` (`community:read`)
- `GET /community/posts/{id}` → `{ "post": {…}, "comments": [ … ] }`
- `POST /community/posts` → `201` (`community:write` + `X-Member-Token`)
```json
{ "board": "review", "title": "맛있어요", "body": "정말 맛있었어요, 추천합니다", "businessId": "업체id", "rating": 5 }
```
  - 제목 2~80자, 본문 5~3000자. `businessId`·`rating`(0~5)은 `review`에서만 반영됩니다.
- `POST /community/posts/{id}/comments` → `201` (`community:write` + `X-Member-Token`): `{ "body": "저도요" }` (1~500자)

글 항목: `id, board, title, body, author(닉네임, 탈퇴 회원은 "탈퇴한 회원"), authorIsAdmin, businessId, businessName, rating, likeCount, commentCount, createdAt`
신고가 3건 쌓여 자동 숨김된 글·댓글, 운영자가 숨긴 글은 나오지 않습니다. 좋아요·신고는 이 API에 아직 없습니다.

---

## 7. 연동 예제 (다른 사이트의 서버 코드)

### 7.1 curl
```bash
KEY=laja_xxxxxxxx
B=https://laja.joybox.day/api/v1

# 가입
curl -s $B/auth/signup -H "Authorization: Bearer $KEY" -H 'content-type: application/json' \
  -d '{"email":"a@b.com","password":"abcd1234","nickname":"테스트","realName":"홍길동","phone":"01012345678","gender":"N","agreeTerms":true,"agreePrivacy":true}'

# 로그인 → token
curl -s $B/auth/login -H "Authorization: Bearer $KEY" -H 'content-type: application/json' \
  -d '{"email":"a@b.com","password":"abcd1234"}'

# 회원 이름으로 글쓰기
curl -s $B/community/posts -H "Authorization: Bearer $KEY" -H "X-Member-Token: lm1.…" \
  -H 'content-type: application/json' -d '{"board":"free","title":"안녕하세요","body":"처음 인사드려요"}'
```

### 7.2 Nuxt 서버 (다른 사이트)
`nuxt.config.ts`
```ts
runtimeConfig: { lajaApiKey: '' }   // 환경변수 NUXT_LAJA_API_KEY 로 채움
```
`server/utils/laja.ts`
```ts
export const laja = <T>(event: any, path: string, opts: Record<string, any> = {}) => {
  const token = getCookie(event, 'laja_token')
  return $fetch<T>(`https://laja.joybox.day/api/v1${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${useRuntimeConfig(event).lajaApiKey}`,
      ...(token ? { 'X-Member-Token': token } : {}),
      ...opts.headers
    }
  })
}
```
`server/api/login.post.ts`
```ts
export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)
  const res = await laja<{ member: any, token: string }>(event, '/auth/login', { method: 'POST', body: { email, password } })
  setCookie(event, 'laja_token', res.token, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 30 * 86400, path: '/' })
  return { member: res.member }
})
```
`server/api/me.get.ts`
```ts
export default defineEventHandler(async (event) => {
  try { return await laja(event, '/auth/me') }
  catch { deleteCookie(event, 'laja_token', { path: '/' }); return { member: null } }
})
```
오류는 `$fetch`가 던지는 `error.data.statusMessage`를 화면에 그대로 보여 주면 됩니다.

### 7.3 전체 동기화 (Node)
```ts
async function pullAll(path: string) {
  const out: any[] = []
  for (let offset = 0, total = 1; offset < total; offset += 200) {
    const r = await fetch(`https://laja.joybox.day/api/v1${path}?limit=200&offset=${offset}`, {
      headers: { Authorization: `Bearer ${process.env.LAJA_API_KEY}` }
    }).then(r => r.json())
    total = r.total
    out.push(...r.items)
  }
  return out
}
```

---

## 8. 두 사이트가 같은 DB를 쓸 때

- **방법 1 (이 API, 권장)**: 다른 사이트는 API로만 접근. 키·권한·횟수 제한·기록이 있어 안전하고, 두 사이트가 서로의 DB 구조에 묶이지 않습니다.
- **방법 2 (같은 D1 직접 연결)**: 두 Worker가 같은 D1(`laos-moa`)을 바인딩. 빠르지만 표 구조 변경이 서로 영향을 줍니다. 쓴다면 **추가만 하고 기존 컬럼은 바꾸지 않기**, 회원 표는 이 API/공용 코드로만 만들기. 자세한 규칙은 [DATABASE.md](./DATABASE.md) 참고.
- 회원 로그인 공유: 같은 `members` 표를 쓰므로 이메일·비밀번호가 사이트마다 같습니다. 쿠키는 도메인이 달라 공유되지 않으므로, 다른 사이트는 위 7.2처럼 **자기 도메인에 토큰 쿠키**를 둡니다.
- 사이트 구분이 필요한 자료(업체 등)는 `site` 컬럼 추가를 권장합니다(DATABASE.md의 A안).

---

## 9. 보안·운영 체크리스트

- [ ] 키를 서버 환경변수에만 저장했다 (코드 저장소·프론트에 없음)
- [ ] 사이트마다 키를 따로 발급했다
- [ ] 필요한 권한만 줬다 (`members:read`·`*:read`는 정말 필요할 때만)
- [ ] 회원 토큰을 `httpOnly`+`secure` 쿠키로 보관한다
- [ ] 가입 화면에 약관·개인정보 동의를 실제로 받고, 문구에 "여러 사이트에서 함께 사용"이 들어 있다
- [ ] 받아 온 실명·휴대폰 등 개인정보를 필요 이상 저장·노출하지 않는다
- [ ] 키가 유출된 것 같으면 **사용 중지 → 새 키 발급 → 서버 설정 교체** 순서로 처리한다 (중지는 즉시 적용)
- [ ] 429를 받으면 `Retry-After`만큼 기다린다 (무한 재시도 금지)

**모니터링**: 관리자 > API에서 키별 **요청 횟수·마지막 사용 시각**을 볼 수 있습니다. 쓰지 않는 키는 삭제하세요.

---

## 10. 라자 쪽 구현 위치 (개발자용)

| 내용 | 파일 |
|------|------|
| 키 발급·검증·권한·횟수 제한 | `server/utils/apiAuth.ts` (`API_SCOPES`에 권한 추가) |
| 회원 토큰 서명·검증 | `server/utils/auth.ts` (`signApiMemberToken`, `readApiMemberToken`) |
| 가입·로그인 공용 로직 | `server/utils/memberAuth.ts` (사이트 가입과 API가 함께 사용) |
| 응답 모양 | `server/utils/apiViews.ts` |
| v1 엔드포인트 | `server/api/v1/**` |
| 관리자 키 관리 API | `server/api/admin/api-clients*` |
| 관리자 화면 | `app/pages/admin/api.vue` |
| 이메일 발송 | `server/utils/mail.ts` (Resend) |
| DB | `db/migrations/008-api-clients.sql` (운영 적용 완료), `009-password-resets.sql` (운영 배포 때 적용), `db/schema.sql` |

새 엔드포인트를 만들 때는 `requireApiClient(event, '권한')`으로 시작하고, 회원 이름으로 하는 작업은 `requireApiMember(event, client)`를 더하세요. 응답에 `password_hash`·base64 이미지가 섞이지 않게 필요한 컬럼만 고르세요.

---

## 11. 아직 없는 것 (필요하면 추가)

- 이메일 인증(가입 시 이메일 소유 확인)
- 회원 탈퇴 API (사이트에는 있음), 닉네임 변경
- 좋아요·신고·글 삭제
- 키 권한 수정 화면 (지금은 새 키 발급으로 대체)
- 키별 허용 IP 제한, 웹훅(새 가입·예약 알림)
- 업체 등록·수정 쓰기 API

---

## 12. 이메일 발송 설정 (비밀번호 찾기에 필요)

비밀번호 찾기는 이메일로 코드를 보내므로 발송 서비스 설정이 먼저 필요합니다. 설정 전에는 `forgot`이 `503`을 돌려줍니다.
라자는 [Resend](https://resend.com)(`https://api.resend.com/emails`)를 쓰도록 만들어져 있습니다.

1. Resend 가입 → **도메인 인증**(예: `joybox.day`의 DNS에 Resend가 알려 주는 레코드 추가) → API 키 발급
2. Worker 비밀 값 등록 (**키 값은 채팅에 붙여 넣지 말고 본인 터미널에서 직접 입력**)
   ```bash
   npx wrangler secret put MAIL_API_KEY --name laos-moa      # Resend API 키 입력
   npx wrangler secret put MAIL_FROM --name laos-moa         # 예) 라자 <noreply@joybox.day>
   ```
3. 확인: 가입한 이메일로 `forgot`을 호출 → 메일에 8자리 코드가 오는지 확인
4. 스팸함으로 가는지도 확인하세요. 도메인 인증(SPF·DKIM)을 해야 잘 도착합니다.

`MAIL_API_URL`은 시험용(가짜 메일 서버)에만 쓰며 운영에서는 비워 둡니다.
