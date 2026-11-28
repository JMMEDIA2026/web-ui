# 라자 운영 메모 (백업·복구·비밀 값)

## 1. 데이터 백업과 복구

운영 DB(D1 `laos-moa`)에는 회원, 예약, 문의, 업체, 글이 들어 있습니다.

### 자동 복구: D1 Time Travel (켜져 있음)
- Cloudflare D1은 **특정 시점으로 되돌리는 기능(Time Travel)** 을 자동으로 제공합니다. 별도 설정이 필요 없고, 2026-11-28에 `wrangler d1 time-travel info laos-moa`로 동작을 확인했습니다.
- 보관 기간은 Cloudflare 요금제에 따라 다릅니다(무료 7일, 유료 30일로 안내됨). 사용 중인 플랜의 기간은 Cloudflare 문서에서 확인하세요.
- 현재 시점 확인: `npx wrangler d1 time-travel info laos-moa`
- 특정 시각으로 복구:
  ```bash
  npx wrangler d1 time-travel restore laos-moa --timestamp=2026-11-28T03:00:00Z
  ```
  (또는 `--bookmark=<info로 확인한 값>`)
- ⚠️ **복구하면 그 시각 이후에 가입·예약된 데이터가 사라집니다.** 복구 직전에 아래 수동 내보내기를 먼저 해 두세요. 복구도 되돌릴 수 있게 "복구 전 북마크"가 출력되니 꼭 적어 두세요.
- 한계: DB 자체를 삭제하면 Time Travel도 함께 사라집니다. DB 삭제는 하지 마세요.

### 수동 백업: 파일로 내보내기
```bash
npx wrangler d1 export laos-moa --remote --output=laos-moa-backup.sql
```
- 파일에 **회원 이메일·실명·휴대폰이 그대로 들어 있습니다.** 저장소(git)에 올리지 말고, 암호를 건 폴더나 안전한 저장소에만 두세요.
- 큰 이미지(base64)도 들어 있어 파일이 커질 수 있습니다.
- 정기 자동 백업(예: 매주 R2에 저장)은 아직 없습니다. 필요하면 Cloudflare R2 사용 설정이 먼저 필요합니다.

## 2. Worker 비밀 값 (본인 터미널에서만 입력, 채팅·문서·코드에 쓰지 않기)
| 이름 | 용도 | 없으면 |
|------|------|--------|
| `SESSION_SECRET` | 로그인 쿠키·회원 토큰 서명 | 로그인 불가(503) |
| `INQUIRY_WEBHOOK_URL` | 문의·예약·키 변경 Slack 알림 | 알림이 로그에만 남음 |
| `MAIL_API_KEY`, `MAIL_FROM` | 이메일 발송(비밀번호 찾기, 예약 상태 안내) — Resend | 비밀번호 찾기 링크가 숨겨지고, 예약 안내 메일은 보내지 않음 |

등록: `npx wrangler secret put 이름 --name laos-moa`

## 3. 새 버전 배포 전 점검
1. `docs/PROJECT.md`의 규칙 확인(운영 배포는 요청받았을 때만)
2. DB 변경(`db/migrations`)이 있으면 **배포 전에** 운영 DB에 먼저 적용(추가만 하는 변경인지 확인)
3. 배포 후 홈·업체·가이드·로그인 화면과 외부 API(키 없이 401)가 열리는지 확인
