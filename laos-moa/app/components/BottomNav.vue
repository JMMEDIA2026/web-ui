<script setup lang="ts">
const route = useRoute()

// 하단 메뉴 4개 (홈 / 업체 / 가이드 / 내 정보). 화면 아래에 떠 있는 둥근 막대이고,
// 현재 메뉴는 연한 회색 알약 배경과 진한 글자로 표시합니다.
const items = [
  { label: '홈', to: '/', icon: 'home', match: (p: string) => p === '/' || p.startsWith('/exchange') },
  { label: '업체', to: '/businesses', icon: 'store', match: (p: string) => p.startsWith('/businesses') },
  { label: '가이드', to: '/guides', icon: 'book', match: (p: string) => p.startsWith('/guides') },
  { label: '내 정보', to: '/me', icon: 'user', match: (p: string) => ['/me', '/reserve', '/advertise', '/login', '/signup', '/terms', '/privacy'].some(x => p.startsWith(x)) }
]

// 얇은 선 아이콘(24×24). 현재 메뉴는 같은 모양을 채워서 보여 줍니다.
const PATHS: Record<string, string> = {
  home: 'M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z',
  store: 'M4 9l1.5-5h13L20 9M4 9v11h16V9M4 9c0 1.7 1.3 3 3 3s3-1.3 3-3c0 1.7 1.3 3 3 3s3-1.3 3-3c0 1.7 1.3 3 3 3M10 20v-5h4v5',
  book: 'M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h10',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0z'
}
</script>

<template>
  <nav
    aria-label="하단 메뉴"
    class="fixed left-1/2 z-40 w-[calc(100%-24px)] max-w-[536px] -translate-x-1/2"
    style="bottom: calc(10px + env(safe-area-inset-bottom, 0px))"
  >
    <ul class="grid h-16 grid-cols-4 gap-1 rounded-full border border-line bg-white/90 p-1.5 shadow-[0_6px_24px_-6px_rgb(20_20_40/0.28)] backdrop-blur-xl">
      <li v-for="item in items" :key="item.to" class="min-w-0">
        <NuxtLink
          :to="item.to"
          class="flex h-full min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-full text-[0.75rem] font-bold transition-colors"
          :class="item.match(route.path) ? 'bg-black/[0.07] text-ink' : 'text-ink-2'"
          :aria-current="item.match(route.path) ? 'page' : undefined"
        >
          <svg viewBox="0 0 24 24" class="size-6" :fill="item.match(route.path) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
            <path :d="PATHS[item.icon]" />
          </svg>
          <span>{{ item.label }}</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
