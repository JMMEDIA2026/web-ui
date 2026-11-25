// 로그인하지 않았어도 오류 없이 { member: null }을 돌려줍니다.
export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'cache-control', 'private, no-store')
  const member = await readMember(event)
  return { member: member ? publicMember(member) : null }
})
