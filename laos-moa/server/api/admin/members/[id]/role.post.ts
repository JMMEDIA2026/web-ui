import { z } from 'zod'

// 회원을 10등급 관리자로 지정하거나 일반 회원으로 되돌립니다. (관리자만 가능)
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id') ?? ''
  const { role } = await parseBody(event, z.object({ role: z.enum(['member', 'admin']) }))
  const db = useDB(event)

  const target = await db.prepare('SELECT id, nickname, role FROM members WHERE id = ?').bind(id).first<{ id: string, nickname: string, role: string }>()
  if (!target) throw createError({ statusCode: 404, statusMessage: '회원을 찾을 수 없습니다' })

  // 관리자 회원이 실수로 자기 권한을 없애 잠기는 일을 막습니다.
  if (role === 'member' && (await readMemberId(event)) === id) {
    throw createError({ statusCode: 400, statusMessage: '본인의 관리자 권한은 직접 해제할 수 없습니다' })
  }

  await db.prepare('UPDATE members SET role = ? WHERE id = ?').bind(role, id).run()
  await notify(event, `[라자] 회원 권한 변경: ${target.nickname} → ${role === 'admin' ? '10등급 관리자' : '일반 회원'}`)
  return { ok: true, role }
})
