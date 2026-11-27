# 라자 외부 연동 API (v1)

다른 사이트가 **같은 DB를 쓰면서** 회원가입·로그인·업체·예약·커뮤니티 자료를 이용할 수 있게 하는 API입니다.
키는 **관리자 > API** 화면에서 발급·중지·삭제합니다.

- 기본 주소: `https://laja.joybox.day/api/v1`
- 모든 응답은 JSON, 오류는 `{ "statusCode": …, "statusMessage": "사람이 읽는 설명" }` 모양입니다.
- 한 키는 1분에 `ratePerMin`회(기본 120)까지 쓸 수 있습니다. 넘으면 `429` + `Retry-After: 60`.

## 1. 가장 중요한 규칙

1. **API 키는 다른 사이트의 서버에만** 두세요. 브라우저(프론트 코드)에 넣으면 누구나 훔쳐 갑니다.
   → 다른 사이트의 서버(또는 Nuxt `server/api`, Cloudflare Worker)가 라자 API를 대신 호출하는 구조로 만드세요.
2. 키는 만들 때 **딱 한 번만** 보입니다(DB에는 해시만 저장). 잃어버리면 새로 발급하세요.
3. 필요한 **권한(scope)만** 주세요. 특히 `members:read`는 실명·휴대폰이 나가므로 꼭 필요한 곳에만.
4. 비밀번호 해시는 어떤 API로도 나가지 않습니다.

## 2. 인증

| 헤더 | 값 | 언제 |
|------|----|------|
| `Authorization` | `Bearer laja_xxxxxxxx…` | 모든 요청 |
| `X-Member-Token` | 로그인/가입으로 받은 `token` | "회원 이름으로" 쓰는 요청(예약·문의·글·댓글, `/auth/me`) |

회원 토큰은 30일 동안 유효하고, **그 토큰을 발급한 키로만** 쓸 수 있습니다. 회원이 탈퇴하면 즉시 무효입니다.

## 3. 권한(scope)

| scope | 할 수 있는 일 |
|-------|---------------|
| `auth` | 회원가입, 로그인, 토큰 확인 |
| `members:read` | 회원 목록·상세 읽기 (실명·휴대폰 포함) |
| `businesses:read` | 업체 목록·상세 읽기 |
| `reservations:read` / `reservations:write` | 예약 목록 읽기 / 회원 대신 예약 요청 |
| `inquiries:read` / `inquiries:write` | 문의 목록 읽기 / 회원 대신 문의 |
| `community:read` / `community:write` | 글·댓글 읽기 / 회원 대신 글·댓글 쓰기 |

## 4. 엔드포인트

### 상태 확인
`GET /ping` — 키가 정상인지, 어떤 권한이 있는지 돌려줍니다.

### 회원가입 · 로그인 (`auth`)

`POST /auth/signup` → `201`
```json
{
  "email": "user@example.com",
  "password": "영문+숫자 8자 이상",
  "nickname": "닉네임 2~12자",
  "realName": "홍길동",
  "phone": "010-1234-5678",
  "gender": "M",
  "agreeTerms": true,
  "agreePrivacy": true
}
```
응답: `{ "member": {…, "grade": {…}}, "token": "lm1.…", "expiresAt": "…" }`
- 이메일·닉네임이 겹치면 `409`. 한 키로 1시간에 30명까지 가입할 수 있습니다.
- `agreeTerms`/`agreePrivacy`는 **다른 사이트 화면에서 회원이 실제로 동의한 경우에만** `true`로 보내세요.
  (약관·개인정보 처리방침에 "여러 사이트에서 회원 정보를 함께 쓴다"는 문구가 필요합니다. 법률 검토를 권장합니다.)

`POST /auth/login`
```json
{ "email": "user@example.com", "password": "…" }
```
응답은 가입과 같습니다. 같은 이메일로 10분에 8번 틀리면 잠시 막힙니다(`429`).

`GET /auth/me` (헤더 `X-Member-Token`) — 토큰이 유효한지 확인하고 최신 회원 정보·등급을 돌려줍니다.

> 로그아웃은 다른 사이트가 토큰을 지우면 됩니다. 같은 이메일·비밀번호로 라자 사이트에서도 그대로 로그인됩니다(DB 하나).

### 회원 (`members:read`)
- `GET /members?q=검색어&since=2026-01-01&limit=50&offset=0`
- `GET /members/{id}`

### 업체 (`businesses:read`)
- `GET /businesses?category=food&limit=50&offset=0` (`includeInactive=1` 이면 비노출 업체도)
- `GET /businesses/{id}`
- 사진은 id만 줍니다. 이미지는 `https://laja.joybox.day/api/photos/{사진id}` 로 불러옵니다.

### 예약 (`reservations:read`, `reservations:write`)
- `GET /reservations?status=pending&memberId=M…&since=…`
- `POST /reservations` (+ `X-Member-Token`)
```json
{ "businessId": "업체id", "name": "홍길동", "contact": "카톡 abc123", "service": "", "date": "2026-12-25", "people": 2, "note": "" }
```

### 문의 (`inquiries:read`, `inquiries:write`)
- `GET /inquiries?status=new&memberId=…`
- `POST /inquiries` (+ `X-Member-Token`)
```json
{ "company": "업체명", "contact": "연락처", "product": "free", "message": "" }
```
`product`: `free` 무료 등록 / `premium` 추천(광고) / `banner` 배너 / `correction` 정보 수정 / `etc` 기타

### 커뮤니티 (`community:read`, `community:write`)
- `GET /community/posts?board=review&business=업체id&limit=50&offset=0` — 게시판: `review` `free` `qna` `tips` `meet`
- `GET /community/posts/{id}` — 글 + 댓글
- `POST /community/posts` (+ `X-Member-Token`): `{ "board": "free", "title": "…", "body": "…" }` (후기는 `businessId`, `rating` 가능)
- `POST /community/posts/{id}/comments` (+ `X-Member-Token`): `{ "body": "…" }`
- 신고로 숨겨진 글·댓글은 나오지 않습니다.

### 전체 자료 가져가기(내보내기)
목록 API는 모두 `total`, `limit`(최대 200), `offset`을 돌려줍니다. 끝까지 `offset += limit`로 반복하면 전체를 가져갈 수 있습니다.
증분 동기화는 `since=<마지막으로 받은 createdAt>`을 쓰세요(회원·예약·문의).

## 5. 호출 예 (다른 사이트의 서버 코드)

```ts
// 예: Nuxt server/api/login.post.ts (다른 사이트)
export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)
  const res = await $fetch('https://laja.joybox.day/api/v1/auth/login', {
    method: 'POST',
    headers: { Authorization: `Bearer ${useRuntimeConfig().lajaApiKey}` },
    body: { email, password }
  })
  // res.token 을 httpOnly 쿠키에 저장해 두고, 이후 요청에 X-Member-Token 으로 보냅니다.
  setCookie(event, 'laja_token', res.token, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 30 * 86400 })
  return { member: res.member }
})
```

## 6. 운영 메모
- 키를 의심스러우면 **사용 중지** 후 새 키를 발급하세요(중지는 즉시 적용).
- `members.signup_client`에 어느 키(사이트)로 가입했는지 기록됩니다. 라자에서 직접 가입하면 비어 있습니다.
- 추가 권한이나 엔드포인트가 필요하면 `server/utils/apiAuth.ts`의 `API_SCOPES`와 `server/api/v1/`에 더하면 됩니다.
- 운영 DB에는 `db/migrations/008-api-clients.sql`을 **운영 배포와 함께** 적용해야 합니다.
