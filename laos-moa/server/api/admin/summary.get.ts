export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = useDB(event)

  const count = async (sql: string, ...args: unknown[]) =>
    (await db.prepare(sql).bind(...args).first<{ n: number }>())?.n ?? 0

  // 라오스 시간(UTC+7) 기준 오늘 날짜
  const today = new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10)

  const [pending, todayCount, total, partners, newInquiries] = await Promise.all([
    count('SELECT COUNT(*) AS n FROM reservations WHERE status = ?', 'pending'),
    count('SELECT COUNT(*) AS n FROM reservations WHERE reserve_date = ? AND status IN (?, ?)', today, 'pending', 'confirmed'),
    count('SELECT COUNT(*) AS n FROM reservations'),
    count('SELECT COUNT(*) AS n FROM partners WHERE active = 1'),
    count('SELECT COUNT(*) AS n FROM inquiries WHERE status = ?', 'new')
  ])

  const recent = await db
    .prepare(
      `SELECT r.id, r.customer_name, r.reserve_date, r.status, r.service, COALESCE(p.name, NULLIF(r.business_name, '')) AS partner_name
       FROM reservations r LEFT JOIN partners p ON p.id = r.partner_id
       ORDER BY r.created_at DESC LIMIT 5`
    )
    .all()

  return { pending, today: todayCount, total, partners, newInquiries, recent: recent.results }
})
