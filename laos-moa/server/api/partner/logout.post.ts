export default defineEventHandler((event) => {
  assertSameOrigin(event)
  endSession(event)
  return { ok: true }
})
