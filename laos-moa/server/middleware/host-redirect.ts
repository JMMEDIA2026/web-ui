// 이전 주소(laos.joybox.day)로 들어오면 새 주소(laja.joybox.day)로 영구 이동시킵니다.
export default defineEventHandler((event) => {
  const host = getRequestHost(event)
  if (host === 'laos.joybox.day') {
    return sendRedirect(event, `https://laja.joybox.day${event.node.req.url ?? '/'}`, 301)
  }
})
