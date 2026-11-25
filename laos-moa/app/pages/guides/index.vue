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
  return guides.filter(g => `${g.title} ${g.summary} ${g.topics.join(' ')}`.toLowerCase().includes(term))
})
</script>

<template>
  <div class="px-4 pt-5 sm:px-5">
    <h1 data-page-title tabindex="-1" class="text-[1.625rem] font-bold text-ink">
      생활 가이드
    </h1>
    <p class="mt-1 text-[0.9375rem] text-ink-2">
      처음 오셔도 막히지 않도록 단계별로 정리하고 있어요.
    </p>

    <form class="relative mt-4" role="search" @submit.prevent>
      <label for="guide-search" class="sr-only">가이드 검색</label>
      <input id="guide-search" v-model="q" type="search" enterkeyhint="search" autocomplete="off" placeholder="가이드를 검색하세요" class="field pr-14">
      <span class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-brand-600">
        <UIcon name="i-lucide-search" class="size-6" />
      </span>
    </form>

    <p class="mt-3 text-[0.875rem] text-ink-2" aria-live="polite">
      가이드 {{ shown.length }}개
    </p>

    <ul v-if="shown.length" class="rows card mt-2 overflow-hidden">
      <li v-for="g in shown" :key="g.slug">
        <NuxtLink :to="`/guides/${g.slug}`" class="flex min-h-[72px] items-center gap-3 px-4 py-3 active:bg-brand-100">
          <span class="grid size-12 shrink-0 place-items-center rounded-lg bg-brand-50">
            <img :src="g.emoji" alt="" width="36" height="36" class="size-9 object-contain" loading="lazy">
          </span>
          <span class="min-w-0 flex-1">
            <span class="block text-[1rem] font-bold text-ink">{{ g.title }}</span>
            <span class="block text-[0.875rem] leading-snug text-ink-2">{{ g.summary }}</span>
          </span>
          <UIcon name="i-lucide-chevron-right" class="size-5 shrink-0 text-ink-2" />
        </NuxtLink>
      </li>
    </ul>
    <div v-else class="card mt-2 p-6 text-center">
      <p class="font-bold text-ink">
        “{{ q.trim() }}” 가이드가 없어요
      </p>
      <button type="button" class="btn btn-quiet mt-3" @click="q = ''">
        검색어 지우기
      </button>
    </div>
  </div>
</template>
