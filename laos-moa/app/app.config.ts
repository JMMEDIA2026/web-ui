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
        // 눌렀을 때 살짝 가라앉고, 마우스를 올리면 1px 떠오르며 그림자가 생깁니다. (움직임 줄이기 설정이면 자동으로 멈춤)
        base: 'min-h-11 min-w-11 justify-center font-semibold transition-[transform,box-shadow,background-color,color,opacity] duration-200 ease-out hover:-translate-y-px active:translate-y-px active:scale-[0.98] hover:shadow-md active:shadow-none'
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
