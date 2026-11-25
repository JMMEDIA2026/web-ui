<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()

const items = computed<NavigationMenuItem[]>(() => [
  { label: '한인 업체', to: '/businesses', active: route.path.startsWith('/businesses') },
  { label: '환전·환율', to: '/exchange', active: route.path.startsWith('/exchange') },
  { label: '생활 가이드', to: '/guides', active: route.path.startsWith('/guides') },
  { label: '광고 안내', to: '/advertise', active: route.path.startsWith('/advertise') }
])
</script>

<template>
  <UHeader to="/" class="bg-default/90 backdrop-blur">
    <template #title>
      <span class="flex items-center gap-2 text-lg font-extrabold tracking-tight">
        <LogoMark class="size-9" />
        라오스모아
      </span>
    </template>

    <UNavigationMenu :items="items" />

    <template #right>
      <UButton to="/advertise#inquiry" label="광고 문의" color="neutral" variant="outline" class="hidden sm:inline-flex" />
      <UButton to="/businesses" label="업체 찾기" icon="i-lucide-search" class="hidden sm:inline-flex" />
    </template>

    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" />
      <div class="mt-6 flex flex-col gap-2">
        <UButton to="/businesses" label="업체 찾기" icon="i-lucide-search" block />
        <UButton to="/advertise#inquiry" label="광고 문의" color="neutral" variant="outline" block />
      </div>
    </template>
  </UHeader>

  <UMain>
    <slot />
  </UMain>

  <footer class="mt-24">
    <div class="lao-band h-3" aria-hidden="true" />
    <UContainer class="grid gap-10 py-14 md:grid-cols-12">
      <div class="md:col-span-5">
        <div class="flex items-center gap-2 text-xl font-extrabold">
          <LogoMark class="size-10" />
          라오스모아
        </div>
        <p class="mt-3 max-w-sm text-sm leading-relaxed text-muted">
          라오스에 사는 한인과 여행자를 위한 생활 정보와 업체 안내입니다. 먼저 정착한 한인의 경험을 한곳에 모읍니다.
        </p>
      </div>

      <div class="md:col-span-3">
        <p class="text-sm font-bold text-highlighted">
          둘러보기
        </p>
        <ul class="mt-3 flex flex-col gap-2 text-sm text-muted">
          <li><NuxtLink to="/businesses" class="hover:text-primary">한인 업체</NuxtLink></li>
          <li><NuxtLink to="/exchange" class="hover:text-primary">환전·환율</NuxtLink></li>
          <li><NuxtLink to="/guides" class="hover:text-primary">생활 가이드</NuxtLink></li>
          <li><NuxtLink to="/advertise" class="hover:text-primary">업체 등록·광고 안내</NuxtLink></li>
        </ul>
      </div>

      <div class="md:col-span-4">
        <p class="text-sm font-bold text-highlighted">
          사업장을 운영하시나요?
        </p>
        <p class="mt-3 text-sm text-muted">
          무료 등록부터 추천 업체, 배너 광고까지 안내해 드립니다.
        </p>
        <UButton to="/advertise#inquiry" label="광고·제휴 문의" class="mt-4" trailing-icon="i-lucide-arrow-right" />
      </div>
    </UContainer>

    <div class="border-t border-default">
      <UContainer class="py-6">
        <p class="text-xs leading-relaxed text-muted">
          © 라오스모아. 사진: Jakub Hałun(메콩 석양, 탓루앙), Gerd Eichmann(빠뚜싸이), Wikimedia Commons,
          <ULink to="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" class="underline">CC BY-SA 4.0</ULink>.
          3D 이모티콘: Microsoft
          <ULink to="https://github.com/microsoft/fluentui-emoji" target="_blank" class="underline">Fluent Emoji</ULink>, MIT 라이선스.
        </p>
      </UContainer>
    </div>
  </footer>
</template>
