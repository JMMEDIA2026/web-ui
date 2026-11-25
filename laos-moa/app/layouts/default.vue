<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()

const items = computed<NavigationMenuItem[]>(() => [
  { label: '한인 업체', to: '/businesses', active: route.path.startsWith('/businesses') },
  { label: '생활 가이드', to: '/guides', active: route.path.startsWith('/guides') },
  { label: '광고 안내', to: '/advertise', active: route.path.startsWith('/advertise') }
])
</script>

<template>
  <UHeader to="/">
    <template #title>
      <span class="flex items-center gap-2 font-bold">
        <img src="/emoji/sun.png" alt="" class="size-7">
        라오스모아
      </span>
    </template>

    <UNavigationMenu :items="items" />

    <template #right>
      <UColorModeButton />
      <UButton to="/advertise#inquiry" label="광고 문의" color="neutral" variant="outline" class="hidden sm:inline-flex" />
    </template>

    <template #body>
      <UNavigationMenu :items="items" orientation="vertical" class="-mx-2.5" />
    </template>
  </UHeader>

  <UMain>
    <slot />
  </UMain>

  <USeparator />

  <UFooter>
    <template #left>
      <p class="text-sm text-muted">
        라오스모아 · 라오스 한인을 위한 정보 커뮤니티 (가칭)
      </p>
    </template>

    <UNavigationMenu
      :items="[
        { label: '한인 업체', to: '/businesses' },
        { label: '생활 가이드', to: '/guides' },
        { label: '광고·제휴 문의', to: '/advertise#inquiry' }
      ]"
      variant="link"
    />

    <template #bottom>
      <p class="text-xs text-muted">
        사진: Jakub Hałun(메콩 석양, 탓루앙), Gerd Eichmann(빠뚜싸이), Wikimedia Commons,
        <ULink to="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" class="underline">CC BY-SA 4.0</ULink>.
        3D 이모티콘: Microsoft
        <ULink to="https://github.com/microsoft/fluentui-emoji" target="_blank" class="underline">Fluent Emoji</ULink>, MIT 라이선스.
      </p>
    </template>
  </UFooter>
</template>
