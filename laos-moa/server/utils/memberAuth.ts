import { z } from 'zod'
import type { H3Event } from 'h3'

// 회원가입 입력 규칙. 사이트 가입(/api/members/signup)과 외부 API(/api/v1/auth/signup)가 함께 씁니다.
export const passwordSchema = z.string().min(8, '비밀번호는 8자 이상이어야 해요').max(64, '비밀번호는 64자 이하로 입력해 주세요')
  .refine(v => /[A-Za-z]/.test(v) && /\d/.test(v), '비밀번호에 영문과 숫자를 함께 넣어 주세요')

export const signupSchema = z.object({
  email: z.string().trim().toLowerCase().email('이메일 형식이 올바르지 않아요').max(120),
  password: passwordSchema,
  nickname: z.string().trim().min(2, '닉네임은 2자 이상이어야 해요').max(12, '닉네임은 12자 이하로 입력해 주세요')
    .regex(/^[가-힣A-Za-z0-9_]+$/, '닉네임은 한글, 영문, 숫자, _ 만 쓸 수 있어요'),
  realName: z.string().trim().min(2, '실명을 입력해 주세요').max(30, '실명이 너무 길어요')
    .regex(/^[가-힣A-Za-z][가-힣A-Za-z .'-]*$/, '실명은 글자만 입력해 주세요'),
  phone: z.string().trim().transform(v => v.replace(/[\s\-().]/g, ''))
    .refine(v => /^\+?\d{8,15}$/.test(v), '휴대폰 번호 형식이 맞지 않아요. 예) 010-1234-5678 또는 +856 20 …'),
  gender: z.enum(['M', 'F', 'N'], { message: '성별을 선택해 주세요' }),
  agreeTerms: z.literal(true, { message: '이용약관에 동의해 주세요' }),
  agreePrivacy: z.literal(true, { message: '개인정보 수집·이용에 동의해 주세요' })
})
export type SignupInput = z.output<typeof signupSchema>

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().min(1, '이메일을 입력해 주세요').max(120),
  password: z.string().min(1, '비밀번호를 입력해 주세요').max(200)
})

// 이메일·닉네임 중복을 확인하고 회원을 만듭니다. 만든 회원 id를 돌려줍니다.
export async function createMember(event: H3Event, data: SignupInput, signupClient = ''): Promise<string> {
  const db = useDB(event)
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
        `INSERT INTO members (id, email, password_hash, nickname, real_name, phone, gender, terms_at, privacy_at, created_at, last_login_at, signup_client)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(id, data.email, passwordHash, data.nickname, data.realName, data.phone, data.gender, now, now, now, now, signupClient)
      .run()
  } catch {
    // 동시에 같은 이메일·닉네임으로 가입한 경우
    throw createError({ statusCode: 409, statusMessage: '이미 가입된 이메일 또는 닉네임이에요' })
  }
  return id
}

// 이메일·비밀번호가 맞으면 회원 id를 돌려주고 마지막 로그인 시각을 갱신합니다. 틀리면 null.
export async function checkLogin(event: H3Event, email: string, password: string): Promise<string | null> {
  const db = useDB(event)
  const row = await db
    .prepare('SELECT id, password_hash FROM members WHERE email = ?')
    .bind(email)
    .first<{ id: string, password_hash: string }>()
  const valid = row ? await verifySecret(password, row.password_hash) : false
  if (!row || !valid) return null
  await db.prepare('UPDATE members SET last_login_at = ? WHERE id = ?').bind(nowIso(), row.id).run()
  return row.id
}
