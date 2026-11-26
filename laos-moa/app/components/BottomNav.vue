<script setup lang="ts">
const route = useRoute()

// 하단 메뉴 5개 (홈 / 업체 / 커뮤니티 / 가이드 / 내 정보). 가운데가 커뮤니티예요. 화면 아래에 떠 있는 둥근 막대이고,
// 현재 메뉴는 연한 회색 알약 배경과 진한 글자로 표시합니다.
const items = [
  { label: '홈', to: '/', icon: 'home', match: (p: string) => p === '/' || p.startsWith('/exchange') },
  { label: '업체', to: '/businesses', icon: 'biz', match: (p: string) => p.startsWith('/businesses') },
  { label: '커뮤니티', to: '/community', icon: 'chat', match: (p: string) => p.startsWith('/community') },
  { label: '가이드', to: '/guides', icon: 'book', match: (p: string) => p.startsWith('/guides') },
  { label: '내 정보', to: '/me', icon: 'me', match: (p: string) => ['/me', '/reserve', '/advertise', '/login', '/signup', '/terms', '/privacy'].some(x => p.startsWith(x)) }
]

</script>

<template>
  <nav
    aria-label="하단 메뉴"
    class="fixed left-1/2 z-40 w-[calc(100%-24px)] max-w-[536px] -translate-x-1/2"
    style="bottom: calc(10px + env(safe-area-inset-bottom, 0px))"
  >
    <ul class="grid h-16 grid-cols-5 gap-0.5 rounded-md border border-default bg-default/95 p-1.5 shadow-[0_8px_28px_-8px_rgb(28_25_23/0.3)] backdrop-blur-xl">
      <li v-for="item in items" :key="item.to" class="min-w-0">
        <NuxtLink
          :to="item.to"
          class="flex h-full min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-sm text-[0.6875rem] font-bold transition-[background-color,color,transform] duration-150 active:scale-95"
          :class="item.match(route.path) ? 'bg-primary/10 text-primary' : 'text-muted'"
          :aria-current="item.match(route.path) ? 'page' : undefined"
        >
          <AppIcon :name="item.icon" class="size-6" :class="item.match(route.path) ? '[&_*]:stroke-[2.6]' : ''" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
