import { z } from 'zod'

const RATE_KIND = 'member-signup'

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email('이메일 형식이 올바르지 않아요').max(120),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 해요').max(64, '비밀번호는 64자 이하로 입력해 주세요')
    .refine(v => /[A-Za-z]/.test(v) && /\d/.test(v), '비밀번호에 영문과 숫자를 함께 넣어 주세요'),
  nickname: z.string().trim().min(2, '닉네임은 2자 이상이어야 해요').max(12, '닉네임은 12자 이하로 입력해 주세요')
    .regex(/^[가-힣A-Za-z0-9_]+$/, '닉네임은 한글, 영문, 숫자, _ 만 쓸 수 있어요'),
  realName: z.string().trim().min(2, '실명을 입력해 주세요').max(30, '실명이 너무 길어요')
    .regex(/^[가-힣A-Za-z][가-힣A-Za-z .'-]*$/, '실명은 글자만 입력해 주세요'),
  phone: z.string().trim().transform(v => v.replace(/[\s\-().]/g, ''))
    .refine(v => /^\+?\d{8,15}$/.test(v), '휴대폰 번호 형식이 맞지 않아요. 예) 010-1234-5678 또는 +856 20 …'),
  gender: z.enum(['M', 'F', 'N'], { message: '성별을 선택해 주세요' }),
  agreeTerms: z.literal(true, { message: '이용약관에 동의해 주세요' }),
  agreePrivacy: z.literal(true, { message: '개인정보 수집·이용에 동의해 주세요' }),
  website: z.string().optional() // 스팸 방지용 숨김 필드
})

export default defineEventHandler(async (event) => {
  assertSameOrigin(event)
  const data = await parseBody(event, bodySchema)

  // 숨김 필드가 채워져 있으면 봇으로 보고 조용히 성공 처리합니다.
  if (data.website) return { ok: true }

  const db = useDB(event)
  const ip = clientIp(event)

  // 같은 곳에서 1시간에 5번까지만 가입할 수 있어요.
  if (await rateCount(db, ip, RATE_KIND, 3600 * 1000) >= 5) {
    throw createError({ statusCode: 429, statusMessage: '가입 시도가 너무 많아요. 잠시 후 다시 시도해 주세요' })
  }

  const dupEmail = await db.prepare('SELECT 1 AS x FROM members WHERE email = ?').bind(data.email).first()
  if (dupEmail) throw createError({ statusCode: 409, statusMessage: '이미 가입된 이메일이에요. 로그인해 주세요' })
  const dupNick = await db.prepare('SELECT 1 AS x FROM members WHERE lower(nickname) = lower(?)').bind(data.nickname).first()
  if (dupNick) throw createError({ statusCode: 409, statusMessage: '이미 사용 중인 닉네임이에요' })

  const id = `M${randomCode(10)}`
  const now = nowIso()
  const passwordHash = await hashSecret(data.password)
  try {
    await db
      .prepare(
        `INSERT INTO members (id, email, password_hash, nickname, real_name, phone, gender, terms_at, privacy_at, created_at, last_login_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(id, data.email, passwordHash, data.nickname, data.realName, data.phone, data.gender, now, now, now, now)
      .run()
  } catch {
    // 동시에 같은 이메일·닉네임으로 가입한 경우
    throw createError({ statusCode: 409, statusMessage: '이미 가입된 이메일 또는 닉네임이에요' })
  }
  await rateAdd(db, ip, RATE_KIND)

  await startMemberSession(event, id)
  return { ok: true }
})
