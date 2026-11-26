// Nuxt UI 설정: 테마 빌더의 주 색 orange, 중립색 stone, 거의 직각인 모서리를 따릅니다.
// 버튼·입력은 손가락으로 누르기 쉽게 최소 44px 높이를 지킵니다.
export default defineAppConfig({
  ui: {
    colors: {
      primary: 'orange',
      neutral: 'stone'
    },
    button: {
      slots: {
        base: 'min-h-11 min-w-11 justify-center font-semibold'
      }
    },
    input: {
      slots: {
        base: 'min-h-12'
      }
    },
    textarea: {
      slots: {
        base: 'min-h-28'
      }
    }
  }
})
