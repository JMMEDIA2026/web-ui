<script setup lang="ts">
import { guides } from '~/data/guides'

useSeoMeta({
  title: '생활 가이드 · 라자',
  description: '비자, 면허, 통신, 병원, 대사관, 은행까지 라오스 생활 가이드.'
})

// 가이드 전체 검색은 이 화면에서 제공합니다. (홈 검색은 업체 검색)
const q = ref('')

const shown = computed(() => {
  const term = q.value.trim().toLowerCase()
  if (!term) return guides
  return guides.filter(g => `${g.title} ${g.summary} ${g.keyPoints.join(' ')} ${g.sections.map(x => `${x.title} ${x.items.join(' ')}`).join(' ')}`.toLowerCase().includes(term))
})
</script>

<template>
  <div class="px-4 pt-5 sm:px-5">
    <h1 data-page-title tabindex="-1" class="text-[1.625rem] font-bold text-highlighted">
      생활 가이드
    </h1>
    <p class="mt-1 text-[0.9375rem] text-muted">
      처음 오셔도 막히지 않도록 단계별로 정리하고 있어요.
    </p>

    <form class="relative mt-4" role="search" @submit.prevent>
      <label for="guide-search" class="sr-only">가이드 검색</label>
      <UInput id="guide-search" v-model="q" type="search" enterkeyhint="search" autocomplete="off" placeholder="가이드를 검색하세요" size="xl" class="w-full" :ui="{ base: 'pe-14' }" />
      <span class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-primary">
        <AppIcon name="search" class="size-6" />
      </span>
    </form>

    <p class="mt-3 text-[0.875rem] text-muted" aria-live="polite">
      가이드 {{ shown.length }}개
    </p>

    <ul v-if="shown.length" class="rows card mt-2 overflow-hidden">
      <li v-for="g in shown" :key="g.slug">
        <NuxtLink :to="`/guides/${g.slug}`" class="flex min-h-[72px] items-center gap-3 px-4 py-3 active:bg-primary/10">
          <span class="grid size-12 shrink-0 place-items-center rounded-lg bg-primary/5">
            <img :src="g.emoji" alt="" width="36" height="36" class="size-9 object-contain" loading="lazy">
          </span>
          <span class="min-w-0 flex-1">
            <span class="block text-[1rem] font-bold text-highlighted">{{ g.title }}</span>
            <span class="block text-[0.875rem] leading-snug text-muted">{{ g.summary }}</span>
          </span>
          <AppIcon name="next" class="size-5 shrink-0 text-muted" />
        </NuxtLink>
      </li>
    </ul>
    <div v-else class="card mt-2 p-6 text-center">
      <p class="font-bold text-highlighted">
        “{{ q.trim() }}” 가이드가 없어요
      </p>
      <UButton color="primary" variant="soft" size="xl" class="mt-3" type="button"  @click="q = ''">
        검색어 지우기
      </UButton>
    </div>
  </div>
</template>
