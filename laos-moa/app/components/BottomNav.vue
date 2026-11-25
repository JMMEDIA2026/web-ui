<script setup lang="ts">
const route = useRoute()

// 하단 고정 메뉴 4개 (홈 / 업체 / 가이드 / 내 정보). 현재 메뉴만 보라색으로 강조합니다.
const items = [
  { label: '홈', to: '/', icon: 'home', match: (p: string) => p === '/' || p.startsWith('/exchange') },
  { label: '업체', to: '/businesses', icon: 'biz', match: (p: string) => p.startsWith('/businesses') },
  { label: '가이드', to: '/guides', icon: 'guide', match: (p: string) => p.startsWith('/guides') },
  { label: '내 정보', to: '/me', icon: 'me', match: (p: string) => p.startsWith('/me') || p.startsWith('/reserve') || p.startsWith('/advertise') }
]
</script>

<template>
  <nav
    aria-label="하단 메뉴"
    class="fixed bottom-0 left-1/2 z-40 w-full max-w-[560px] -translate-x-1/2 border-t border-line bg-white"
    style="padding-bottom: env(safe-area-inset-bottom, 0px)"
  >
    <ul class="grid h-16 grid-cols-4">
      <li v-for="item in items" :key="item.to" class="min-w-0">
        <NuxtLink
          :to="item.to"
          class="flex h-full min-h-[44px] flex-col items-center justify-center gap-0.5 text-[0.8125rem] font-bold"
          :class="item.match(route.path) ? 'text-brand-600' : 'text-ink-2'"
          :aria-current="item.match(route.path) ? 'page' : undefined"
        >
          <AppIcon :name="item.icon" class="size-7 transition" :class="item.match(route.path) ? 'scale-110' : 'opacity-60 saturate-50'" />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
