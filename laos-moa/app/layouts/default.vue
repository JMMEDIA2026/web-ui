<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const { region } = useRegion()
const sheetOpen = useRegionSheet()
const keyboardOpen = useKeyboardOpen()

// 페이지가 definePageMeta로 화면 구성을 정합니다.
//  header:false → 자체 상단 바 사용 / region:true → 지역 선택 표시 / nav:false → 하단 메뉴 숨김(상세 화면)
const showHeader = computed(() => route.meta.header !== false)
const showRegion = computed(() => route.meta.region === true)
const hasNav = computed(() => route.meta.nav !== false)
const isExplorer = computed(() => route.meta.explorer === true)
// 검색 키보드가 열려 있는 동안에는 하단 메뉴를 숨깁니다.
const navVisible = computed(() => hasNav.value && !keyboardOpen.value)

// 화면을 옮기면 새 화면의 제목으로 포커스를 옮겨 보조기술이 화면 변경을 알 수 있게 합니다.
let stop: (() => void) | undefined
onMounted(() => {
  stop = router.afterEach(() => {
    nextTick(() => {
      document.querySelector<HTMLElement>('[data-page-title]')?.focus({ preventScroll: true })
    })
  })
})
onBeforeUnmount(() => stop?.())
</script>

<template>
  <div
    class="laja-public mx-auto min-h-dvh w-full max-w-[560px] bg-app-bg sm:border-x sm:border-line"
    :class="route.meta.theme === 'nol' ? 'theme-nol' : ''"
    :style="{ '--nav-h': navVisible ? '76px' : '0px' }"
  >
    <a href="#main-content" class="skip-link">본문 바로가기</a>
    <header
      v-if="showHeader"
      class="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-surface px-4"
      style="height: calc(56px + env(safe-area-inset-top, 0px)); padding-top: env(safe-area-inset-top, 0px)"
    >
      <NuxtLink to="/" class="-ml-1 inline-flex min-h-11 shrink-0 items-center px-1" aria-label="라자 홈">
        <AppLogo />
      </NuxtLink>

      <button
        v-if="showRegion"
        type="button"
        class="inline-flex min-h-11 min-w-0 items-center gap-1 rounded-lg bg-brand-100 pl-3 pr-2 text-[0.9375rem] font-bold text-brand-600"
        aria-haspopup="dialog"
        :aria-label="`지역 선택. 현재 ${region.label}`"
        @click="sheetOpen = true"
      >
        <AppIcon name="pin" class="size-4" />
        <span class="min-w-0 truncate">{{ region.label }}</span>
        <AppIcon name="next" class="size-5 shrink-0 rotate-90" />
      </button>
    </header>

    <main
      id="main-content"
      tabindex="-1"
      :style="isExplorer ? undefined : { paddingBottom: hasNav ? 'calc(76px + env(safe-area-inset-bottom, 0px) + 24px)' : '24px' }"
    >
      <slot />
    </main>

    <BottomNav v-if="navVisible" />
    <RegionSheet />
  </div>
</template>
