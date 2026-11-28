# 라자 데이터베이스 정리 (DB 하나 · 사이트 둘)

> 조사 시각: 2026-11-26 (UTC 18시 이후). 운영 DB를 **읽기만** 해서 정리했습니다. 개인 정보(이메일, 전화번호, 비밀번호 값)는 조회하지도, 적지도 않았습니다.
> 이 문서의 3장은 **오늘 발견한 문제**입니다. 먼저 읽어 주세요.

---

## 1. 지금 연결된 DB

| 항목 | 내용 |
|---|---|
| 종류 | Cloudflare D1 (SQLite 방식) |
| DB 이름 | `laos-moa` |
| 코드에서의 이름 | 바인딩 `DB` (서버 코드는 `useDB(event)`로 꺼내 씀 — `server/utils/db.ts`) |
| 연결 위치 | `nuxt.config.ts` → `nitro.cloudflare.wrangler.d1_databases` (배포할 때 Worker `laos-moa`에 자동으로 붙음) |
| 쓰는 Worker | `laos-moa` 1개 → 주소 `laja.joybox.day`, `laos.joybox.day`(예전 주소, 새 주소로 이동) |
| 로컬 시험 | `wrangler dev --local`이 만드는 임시 DB. `db/schema.sql`로 표를 만듭니다. 운영 DB와 무관 |
| 접속(읽기) | `npx wrangler d1 execute laos-moa --remote --command "SELECT ..."` (Cloudflare 토큰 필요) |
| 이미지 저장 | 업체 사진·배너는 **DB 안에 base64 글자**로 저장 (별도 파일 저장소 R2 없음) |

---

## 2. 운영 DB의 표 16개 (현재)

| 표 | 행 수 | 누가 쓰나 | 용도 |
|---|---:|---|---|
| `members` | 1 | 라자 | 회원(관리자 1명). 이메일·비밀번호 해시·닉네임·실명·휴대폰·성별·권한(`role`) |
| `settings` | 1 | 라자 | 설정. 키 `admin_password`(관리자 비밀번호 해시) 하나뿐 |
| `rate_hits` | 10 | 라자 | 요청 횟수 제한 기록(로그인·예약·글쓰기 도배 방지). 하루 지나면 자동 정리 |
| `businesses` | **9** | 라자 1 + **다른 프로젝트 8** | 업체. 3장 참고 |
| `business_photos` | 1 | 라자 | 업체 사진(큰 것·작은 것 base64) |
| `banners` | 0 | 라자 | 홈 광고 배너(이미지 base64) |
| `partners` | 0 | 라자 | 협력업체 계정(사장님 로그인) |
| `reservations` | 0 | 라자 | 예약 요청 |
| `inquiries` | 0 | 라자 | 광고·정보 수정·제휴 문의 |
| `community_posts` | 1 | 라자 | 커뮤니티 글(운영진 이용 안내 1개) |
| `community_comments` | 0 | 라자 | 댓글 |
| `community_likes` | 0 | 라자 | 좋아요 |
| `community_reports` | 0 | 라자 | 신고 |
| `guides` | 6 | **다른 프로젝트** | 가이드 글(제목·본문·작성자·조회수). 라자는 쓰지 않음(라자 가이드는 코드 파일 `app/data/guides.ts`) |
| `exchange_rates` | 1 | **다른 프로젝트** | 환율 기록. 라자는 쓰지 않음(라자는 환율 API를 직접 호출) |
| `d1_migrations` | 3 | **다른 프로젝트** | wrangler 마이그레이션 기록: `0001_base`, `0002_laomoa_ext`, `0003_seed` |

인덱스 13개: `idx_banners_active`, `idx_photos_business`, `idx_businesses_category`, `idx_ccomments_post`, `idx_cposts_board`, `idx_cposts_business`, `idx_cposts_member`, `idx_members_nickname`, `idx_partners_username`, `idx_rate_hits`, `idx_reservations_business`, `idx_reservations_partner`, `idx_reservations_status`

### 칸 구조 (표별)

`PK`는 기본 키입니다. **굵은 글씨**는 라자 저장소(`db/schema.sql`)에 없는, **운영 DB에만 있는 칸**입니다.

- **members**: `id` PK, `email`, `password_hash`, `nickname`, `real_name`, `phone`, `gender`, `terms_at`, `privacy_at`, `created_at`, `last_login_at`, `role`
- **settings**: `key` PK, `value`
- **rate_hits**: `ip`, `kind`, `at`
- **businesses**: `id` PK, `name`, `category`, `area`, `address`, `lat`, `lng`, `description`, `hours`, `contact`(옛 한 줄 또는 JSON 연락 방법 목록), `map_url`, `partner_id`, `sponsored`, `active`, `created_at`, `updated_at`, **`category_label`**, **`short_desc`**, **`kakao`**, **`images`**, **`is_premium`**, **`rating`**, **`review_count`**, **`exchange_rate`**, **`sort_order`**
- **business_photos**: `id` PK, `business_id`, `full_b64`, `thumb_b64`, `mime`, `is_cover`, `sort_order`, `created_at`
- **banners**: `id` PK, `title`, `advertiser`, `link_url`, `image_b64`, `mime`, `active`, `sort_order`, `starts_at`, `ends_at`, `clicks`, `created_at`, `updated_at`
- **partners**: `id` PK, `name`, `category`, `contact`, `code_hash`, `active`, `created_at`, **`username`**, **`business_id`**
- **reservations**: `id` PK, `partner_id`, `customer_name`, `customer_contact`, `service`, `reserve_date`, `people`, `note`, `status`, `partner_memo`, `created_at`, `updated_at`, `business_id`, `business_name`, `member_id`, **`site`**, **`reserve_time`**, **`customer_email`**
- **inquiries**: `id` PK, `company`, `contact`, `product`, `message`, `status`, `created_at`, `member_id`, **`contact_name`**, **`email`**, **`site`**
- **community_posts**: `id` PK, `board`, `title`, `body`, `member_id`, `business_id`, `rating`, `like_count`, `comment_count`, `report_count`, `hidden`, `created_at`, **`author_name`**, **`views`**, **`site`**
- **community_comments**: `id` PK, `post_id`, `member_id`, `body`, `report_count`, `hidden`, `created_at`, **`author_name`**
- **community_likes**: (`post_id`, `member_id`) PK, `created_at`
- **community_reports**: `id` PK, `target_type`, `target_id`, `member_id`, `reason`, `created_at`
- **guides** (다른 프로젝트): `id` PK, `title`, `category`, `summary`, `content`, `author`, `updated_at`, `read_count`, `verified`, `sort_order`
- **exchange_rates** (다른 프로젝트): `id` PK, `usd_to_lak`, `krw_to_lak`, `usd_to_krw`, `updated_at`, `source`
- **d1_migrations**: `id` PK, `name`, `applied_at`

### 마이그레이션이 두 갈래입니다

| | 라자 | 다른 프로젝트 |
|---|---|---|
| 방식 | 파일을 직접 실행: `wrangler d1 execute --file=db/migrations/00X.sql` | `wrangler d1 migrations apply` (기록이 `d1_migrations`에 남음) |
| 파일 | `002 reservation-business`, `003 members`, `004 member-role`, `005 business-photos`, `006 banners`, `007 community` | `0001_base`, `0002_laomoa_ext`, `0003_seed` |
| 기록 | 기록 표 없음(파일이 곧 기록) | `d1_migrations` 표 |

두 갈래가 같은 DB를 건드리면서 **서로의 변경을 모릅니다.** 4장의 "단일 출처" 규칙으로 정리해야 합니다.

---

## 3. 오늘 발견한 문제 — 라자 사이트에 다른 프로젝트의 시험 업체가 보입니다

**무슨 일인가**
- 같은 DB에 다른 프로젝트(이름에 `laomoa`가 들어간 확장·시드 마이그레이션)가 오늘 18시 14분(UTC)쯤 표와 칸을 추가하고, 시험용 업체 8개(`biz-1` ~ `biz-8`)를 넣었습니다. **제가 한 작업이 아닙니다.** (제 마이그레이션은 파일 방식 002~007뿐입니다.)
- 라자는 `businesses` 표에서 `active = 1`인 업체를 전부 보여 주기 때문에, 이 8개가 **지금 운영 사이트(laja.joybox.day)에 그대로 보입니다.**

**운영 화면에 생긴 문제 (직접 확인)**
1. 지어낸 업체 8개가 보입니다. 이 중 4개는 "광고"로 표시됩니다. 이름 예: "비엔티안 롱비엔 컨트리클럽", "메콩 바이크 & 오토바이 렌트". 시험 데이터라서 평점(4.6~4.9)과 후기 수(18~114)도 지어낸 값입니다. 라자는 "확인되지 않은 업체·후기·가격을 보여 주지 않는다"는 원칙이 있어서, 이 원칙에 어긋납니다.
2. 업종 6개(`golf`, `rental`, `restaurant`, `market`, `medical`, `realestate`)는 라자의 업종 목록(`food`, `mart`, `exchange`, `massage`, `hospital`, `school`, `rent`, `job`)에 없습니다. 그래서 이 업체들의 **대표 이미지가 깨지고**(`/images/categories/...`가 404), 상세 화면에 **"undefined"** 글자가 보입니다.
3. 이 업체들이 라자의 홈 "라자 추천 업체", 업체 목록, 지도에 섞여 나옵니다.

**그대로 둬도 되는 것**: 라자의 `members`, `community_*`, `banners` 등은 영향이 없습니다. 칸이 추가만 됐고 라자 코드는 모르는 칸을 무시합니다.

**해결 방법 (결정이 필요합니다)**

| 방법 | 내용 | 장점 | 단점 |
|---|---|---|---|
| **A. 사이트 구분 칸 추가 (권장)** | `businesses`에 `site` 칸을 더하고, 시험 8개는 `laomoa`, VIP는 `laja`로 표시. 라자 코드는 `site = 'laja'`만 보여 줌 | 두 사이트가 한 표를 안전하게 나눠 씀. 4장의 최종 구조와 같음 | 마이그레이션 + 코드 수정 + 배포가 필요. 다른 프로젝트 코드도 `site`를 쓰게 맞춰야 함 |
| B. 시험 업체 숨기기 | 8개의 `active`를 0으로 바꿈 | 가장 빠름 | 다른 프로젝트에서도 안 보임. 다른 프로젝트가 쓰는 데이터를 건드림 |
| C. 시험 업체 삭제 | 8개 행 삭제 | 가장 깔끔 | 되돌릴 수 없고, 다른 프로젝트가 필요로 할 수 있음 |

> 어느 방법이든 **다른 프로젝트의 데이터를 바꾸는 일**이라서, 그 프로젝트를 쓰는 분(또는 같은 DB를 쓰기로 한 사이트)과 먼저 정해야 합니다.

---

## 4. 사이트 2개 · DB 1개로 쓰는 방법 (권장 설계)

### 4-1. 기본 원리
- Cloudflare D1은 **같은 DB(같은 `database_id`)를 여러 Worker에 붙일 수 있습니다.** 두 번째 사이트의 Worker 설정에 같은 DB를 `d1_databases`로 넣으면 끝납니다.
- 문제는 연결이 아니라 **데이터가 섞이는 것**입니다. 3장이 바로 그 예입니다. 그래서 "무엇을 공유하고 무엇을 나눌지"를 표마다 정해야 합니다.

### 4-2. 표별 공유 기준 (제안)

| 표 | 공유/분리 | 방법 |
|---|---|---|
| `members` | **공유** | 한 계정으로 두 사이트 이용. 가입한 사이트를 알고 싶으면 `joined_site` 칸 추가 |
| `businesses` | **분리** | `site` 칸 추가(`laja` / 두 번째 사이트 이름). 모든 조회에 `WHERE site = ?` |
| `business_photos` | 업체를 따라감 | `business_id`로 연결되므로 업체의 사이트를 따름 |
| `banners` | **분리** | `site` 칸 추가 |
| `community_posts` | **분리** | `site` 칸이 **이미 있음**. 모든 조회·글쓰기에 사용. (댓글·좋아요·신고는 글을 따라감) |
| `reservations`, `inquiries` | **분리** | `site` 칸이 이미 있음. 관리자 화면도 사이트별로 걸러서 보기 |
| `partners` | **분리** | `site` 칸 추가 |
| `settings` | **분리** | 키에 사이트 이름을 붙이기: `laja.admin_password`, `site2.admin_password` (지금 키 `admin_password`는 한 사이트 것) |
| `rate_hits` | 공유 | `kind` 앞에 사이트 이름: `laja:login` 처럼 |
| `guides`, `exchange_rates` | 한 쪽만 사용 | 다른 프로젝트 전용으로 두거나, `site` 칸을 추가해 나눔 |

### 4-3. 반드시 지킬 규칙 (사고 방지)
1. **마이그레이션은 한 곳에서만 관리**합니다. 한 저장소(예: 이 저장소의 `db/migrations`)에 번호를 붙여 두고, 두 사이트 모두 이 파일로만 DB를 바꿉니다. 기록 표(`d1_migrations`)도 한 방식으로 통일합니다.
2. **추가만 합니다(add-only).** 칸 추가는 `DEFAULT`를 꼭 넣고, 표·칸의 **삭제나 이름 변경은 하지 않습니다.** 한 사이트가 새 코드를 배포하기 전에는 다른 사이트가 깨지기 때문입니다.
3. **배포 순서:** ① DB 변경(추가만) → ② 두 사이트 코드를 차례로 배포. 새 칸은 기본값이 있어서 아직 배포 안 한 사이트도 계속 작동해야 합니다.
4. **새 데이터는 `site` 없이 넣을 수 없게** 합니다. 새 표에는 처음부터 `site TEXT NOT NULL`을 넣고, 기본값은 일부러 두지 않아 실수로 비워 두는 일을 막습니다. (기존 표에 추가할 때만 현재 사이트 이름을 기본값으로 둠)
5. **운영 DB에 시험 데이터를 넣지 않습니다.** 시험은 로컬 DB(`--local`)에서만 합니다. 3장이 이 규칙을 어겨서 생긴 문제입니다.
6. 사이트마다 **Worker 비밀 값**을 따로 둡니다: `SESSION_SECRET`, `INQUIRY_WEBHOOK_URL`(Slack 알림은 사이트별 채널 추천).

### 4-4. 로그인을 어떻게 할까
| 선택 | 설명 | 필요한 일 |
|---|---|---|
| **사이트마다 따로 로그인 (쉬움)** | 같은 계정이지만 각 사이트에서 로그인. 도메인이 다르면 어차피 이렇게 됨 | 없음. 두 Worker의 `SESSION_SECRET`은 달라도 됨 |
| **한 번만 로그인 (같은 상위 도메인일 때)** | 예: `laja.joybox.day`와 `site2.joybox.day`. 쿠키를 `.joybox.day`로 공유 | 두 사이트 `SESSION_SECRET`을 같게 하고, 쿠키에 `Domain=.joybox.day`를 줌. 한 사이트가 뚫리면 다른 사이트도 위험해지므로 신중히 |

관리자 권한은 지금 `members.role = 'admin'` 하나라서 **두 사이트 모두의 관리자**가 됩니다. 사이트별 관리자가 필요하면 `site_admins(member_id, site)` 표를 새로 만드세요.

### 4-5. 두 번째 사이트를 연결하는 순서
1. **정리 먼저:** 3장의 시험 업체 문제를 방법 A/B/C 중 하나로 해결합니다.
2. **구분 칸 추가:** 4-2의 표대로 `site` 칸을 추가하는 마이그레이션 `008`을 이 저장소 `db/migrations`에 작성 → 운영 DB에 적용(기존 행은 `site = 'laja'`, 다른 프로젝트 시험 8개는 그 사이트 이름으로).
3. **라자 코드 수정:** 업체·배너·협력업체·설정·횟수 제한 조회에 `site = 'laja'` 조건을 붙이고, 글·예약·문의에는 이미 있는 `site` 칸을 채웁니다. 배포.
4. **두 번째 사이트 연결:** 그 사이트 Worker 설정에 같은 D1을 넣습니다.
   ```jsonc
   // wrangler.jsonc (두 번째 사이트)
   "d1_databases": [
     { "binding": "DB", "database_name": "laos-moa", "database_id": "<laos-moa의 database_id>" }
   ]
   ```
   `database_id`는 `nuxt.config.ts`의 `d1_databases` 항목과 같은 값입니다.
5. **두 번째 사이트 코드:** 모든 조회에 자기 `site` 값으로 조건을 겁니다(예: `WHERE site = 'site2'`). 새 글·예약·문의에는 자기 `site`를 채웁니다.
6. **시험:** 로컬 DB로 두 사이트가 서로의 데이터를 못 보는지 확인한 뒤 배포합니다.
7. **백업:** 연결 전에 `wrangler d1 export laos-moa --remote --output=backup.sql`로 파일을 받아 둡니다. (D1의 시점 복구 기능은 요금제에 따라 달라서 대시보드에서 확인하세요.)

### 4-6. 알아 둘 한계
- D1은 쓰기가 한 번에 하나씩 처리됩니다. 두 사이트의 쓰기가 많아지면 느려질 수 있습니다. (읽기는 문제없음)
- DB 크기 한도는 요금제마다 다릅니다. 이미지를 DB에 base64로 넣는 방식은 용량을 빨리 씁니다. 사진이 늘면 R2(파일 저장소)로 옮기길 권합니다.
- 한 DB를 두 사이트가 쓰면 **한쪽 실수가 다른 쪽에 바로 영향**을 줍니다(오늘의 사고처럼). 규칙 1~5를 꼭 지켜 주세요.

---

## 5. 결정할 것 (순서대로)

1. **3장의 시험 업체 처리:** A(구분 칸, 권장) / B(숨기기) / C(삭제) 중 선택. 급하다면 일단 **B로 라자 화면부터 정상화**하고 A로 가는 방법도 있습니다.
2. **다른 프로젝트(두 번째 사이트)가 무엇인지** 알려 주세요: 사이트 이름, 도메인, 같은 상위 도메인인지, 그 코드를 제가 볼 수 있는지.
3. **로그인:** 사이트별 로그인 / 한 번에 로그인 중 선택.
4. **관리자:** 한 명이 두 사이트 관리자인지, 사이트별로 나눌지.
5. **마이그레이션 관리 방식 통일:** `wrangler d1 migrations`(기록 표 사용) 하나로 통일 권장.
