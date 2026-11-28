export default defineEventHandler((event) => {
  assertSameOrigin(event)
  endSession(event)
  endMemberSession(event)
  return { ok: true }
})
