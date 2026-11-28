export default defineEventHandler((event) => {
  assertSameOrigin(event)
  endMemberSession(event)
  return { ok: true }
})
