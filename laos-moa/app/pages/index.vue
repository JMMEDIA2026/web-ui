<script setup lang="ts">
import { guides } from '~/data/guides'

// 일반 메인: 검색 → 카테고리 → 환율 계산기 → 생활 가이드 (지도는 표시하지 않음)
definePageMeta({ region: true })

useSeoMeta({
  title: '라오스모아 · 라오스 생활정보와 한인 업체',
  description: '라오스 한인과 방문자를 위한 생활 가이드, 환율 계산기, 주변 업체 찾기.'
})

const { regionKey } = useRegion()
const q = ref('')

// 홈 검색은 업체 검색입니다. 검색어와 지역을 업체 탐색 화면으로 넘깁니다.
function search() {
  const keyword = q.value.trim()
  navigateTo({ path: '/businesses', query: { ...(keyword ? { q: keyword } : {}), region: regionKey.value } })
}

const toBusinesses = (category: string) => ({ path: '/businesses', query: { category, region: regionKey.value } })

// 4열 × 2행. 구인·구직은 아직 해당 목록 기능이 없어서, 실제로 등록된 업종인 마사지로 대신했습니다.
const shortcuts = computed(() => [
  { label: '한식당', icon: 'i-lucide-utensils', to: toBusinesses('food') },
  { label: '마트', icon: 'i-lucide-shopping-basket', to: toBusinesses('mart') },
  { label: '병원·약국', icon: 'i-lucide-stethoscope', to: toBusinesses('hospital') },
  { label: '환전', icon: 'i-lucide-banknote', to: toBusinesses('exchange') },
  { label: '렌트', icon: 'i-lucide-house', to: toBusinesses('rent') },
  { label: '마사지', icon: 'i-lucide-flower-2', to: toBusinesses('massage') },
  { label: '비자', icon: 'i-lucide-id-card', to: '/guides/visa' },
  { label: '통신', icon: 'i-lucide-smartphone', to: '/guides/telecom' }
])

const firstGuides = ['visa', 'telecom', 'health', 'banking']
  .map(slug => guides.find(g => g.slug === slug))
  .filter((g): g is NonNullable<typeof g> => !!g)
</script>

<template>
  <div class="px-4 pt-5 sm:px-5">
    <h1 data-page-title tabindex="-1" class="text-[1.6875rem] font-bold leading-[1.3] text-ink">
      오늘도 편하게,<br>라오스 생활.
    </h1>

    <!-- 검색: 키보드의 검색 동작과 아이콘 버튼은 같은 결과를 실행합니다. -->
    <form class="relative mt-4" role="search" @submit.prevent="search">
      <label for="home-search" class="sr-only">업체 검색</label>
      <input
        id="home-search"
        v-model="q"
        type="search"
        enterkeyhint="search"
        autocomplete="off"
        placeholder="업체명이나 업종을 검색하세요"
        class="field pr-14 shadow-sm"
      >
      <button type="submit" class="absolute right-1 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-xl text-brand-600" aria-label="검색">
        <UIcon name="i-lucide-search" class="size-6" />
      </button>
    </form>

    <!-- 주요 카테고리 -->
    <nav class="mt-5" aria-label="주요 카테고리">
      <ul class="grid grid-cols-4 gap-2">
        <li v-for="s in shortcuts" :key="s.label">
          <NuxtLink :to="s.to" class="card flex min-h-[88px] flex-col items-center justify-center gap-1.5 px-1 py-3 text-center active:bg-brand-100">
            <UIcon :name="s.icon" class="size-7 text-brand-600" />
            <span class="text-[0.875rem] font-semibold leading-tight text-ink">{{ s.label }}</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <!-- 환율 계산기 -->
    <div class="mt-6">
      <RateCalculator show-detail-link />
    </div>

    <!-- 생활 가이드 -->
    <section class="mt-8" aria-labelledby="guide-title">
      <div class="flex items-end justify-between">
        <h2 id="guide-title" class="text-[1.3125rem] font-bold text-ink">
          처음 오셨나요?
        </h2>
        <NuxtLink to="/guides" class="inline-flex min-h-11 items-center text-[0.875rem] font-bold text-brand-600">
          가이드 전체
          <UIcon name="i-lucide-chevron-right" class="size-4" />
        </NuxtLink>
      </div>
      <ul class="rows card mt-2 overflow-hidden">
        <li v-for="g in firstGuides" :key="g.slug">
          <NuxtLink :to="`/guides/${g.slug}`" class="flex min-h-[68px] items-center gap-3 px-4 py-3 active:bg-brand-100">
            <span class="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <UIcon :name="g.icon" class="size-6" />
            </span>
            <span class="min-w-0 flex-1">
              <span class="block text-[1rem] font-bold text-ink">{{ g.title }}</span>
              <span class="block text-[0.875rem] leading-snug text-ink-2">{{ g.summary }}</span>
            </span>
            <UIcon name="i-lucide-chevron-right" class="size-5 shrink-0 text-ink-2" />
          </NuxtLink>
        </li>
      </ul>
    </section>

    <!-- 광고는 주요 기능보다 아래에, 작게 둡니다. -->
    <p class="mt-8 text-center text-[0.875rem] text-ink-2">
      업체를 운영하시나요?
      <NuxtLink to="/advertise" class="inline-flex min-h-11 items-center font-bold text-brand-600 underline underline-offset-2">업체 등록·광고 문의</NuxtLink>
    </p>
  </div>
</template>
