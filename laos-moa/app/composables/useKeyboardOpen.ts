// 모바일 키보드가 열려 있으면 true. 이때는 하단 메뉴를 숨겨 입력 화면을 넓게 씁니다.
export function useKeyboardOpen() {
  const open = ref(false)

  onMounted(() => {
    const vv = window.visualViewport
    if (!vv) return
    const baseline = () => window.innerHeight
    const onResize = () => {
      open.value = vv.height < baseline() * 0.75
    }
    vv.addEventListener('resize', onResize)
    onBeforeUnmount(() => vv.removeEventListener('resize', onResize))
  })

  return open
}
