<script setup lang="ts">
import { guides } from '~/data/guides'

// 일반 메인: 검색 → 카테고리 → 환율 계산기 → 생활 가이드 (지도는 표시하지 않음)
definePageMeta({ region: true })

useSeoMeta({
  title: '라자 · 라오스 자유 여행 생활정보와 한인 업체',
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
  { label: '한식당', emoji: '/emoji/food.png', to: toBusinesses('food') },
  { label: '마트', emoji: '/emoji/mart.png', to: toBusinesses('mart') },
  { label: '병원·약국', emoji: '/emoji/hospital.png', to: toBusinesses('hospital') },
  { label: '환전', emoji: '/emoji/exchange.png', to: toBusinesses('exchange') },
  { label: '렌트', emoji: '/emoji/house.png', to: toBusinesses('rent') },
  { label: '마사지', emoji: '/emoji/massage.png', to: toBusinesses('massage') },
  { label: '비자', emoji: '/emoji/visa.png', to: '/guides/visa' },
  { label: '통신', emoji: '/emoji/phone.png', to: '/guides/telecom' }
])

// 환율은 실제 값을 불러온 경우에만 숫자를 보여 줍니다.
const { data: rates } = await useFetch<{ krwLak: number }>('/api/rates', { key: 'rates', default: () => null })
const fmtNum = (n: number) => n.toLocaleString('ko-KR', { maximumFractionDigits: 0 })

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
      <button type="submit" class="absolute right-1 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-lg text-brand-600" aria-label="검색">
        <AppIcon name="search" class="size-6" />
      </button>
    </form>

    <!-- 주요 카테고리 -->
    <nav class="mt-5" aria-label="주요 카테고리">
      <ul class="grid grid-cols-4 gap-3 pb-3">
        <li v-for="s in shortcuts" :key="s.label">
          <NuxtLink :to="s.to" class="soft-btn flex min-h-[92px] flex-col items-center justify-center gap-1.5 px-1 py-3 text-center">
            <img :src="s.emoji" alt="" width="40" height="40" class="size-10 object-contain" loading="lazy">
            <span class="text-[0.875rem] font-semibold leading-tight text-ink">{{ s.label }}</span>
          </NuxtLink>
        </li>
      </ul>
    </nav>

    <!-- 오늘의 환율: 작게 보여 주고, 변환은 환율 화면에서 합니다. -->
    <NuxtLink to="/exchange" class="card mt-5 flex min-h-[64px] items-center gap-3 px-4 py-3 active:bg-brand-100" aria-label="환율 변환 화면으로 이동">
      <img src="/emoji/exchange.png" alt="" width="32" height="32" class="size-8 shrink-0 object-contain">
      <span class="min-w-0 flex-1">
        <span class="block text-[0.8125rem] text-ink-2">오늘의 환율</span>
        <span v-if="rates" class="block text-[1rem] font-bold text-ink">1,000원 = {{ fmtNum(1000 * rates.krwLak) }}킵</span>
        <span v-else class="block text-[1rem] font-bold text-ink">환율 변환·환전업체 보기</span>
      </span>
      <span class="inline-flex shrink-0 items-center text-[0.875rem] font-bold text-brand-600">
        변환하기
        <AppIcon name="next" class="size-4" />
      </span>
    </NuxtLink>

    <!-- 생활 가이드 -->
    <section class="mt-8" aria-labelledby="guide-title">
      <div class="flex items-end justify-between">
        <h2 id="guide-title" class="text-[1.3125rem] font-bold text-ink">
          처음 오셨나요?
        </h2>
        <NuxtLink to="/guides" class="inline-flex min-h-11 items-center text-[0.875rem] font-bold text-brand-600">
          가이드 전체
          <AppIcon name="next" class="size-4" />
        </NuxtLink>
      </div>
      <ul class="rows card mt-2 overflow-hidden">
        <li v-for="g in firstGuides" :key="g.slug">
          <NuxtLink :to="`/guides/${g.slug}`" class="flex min-h-[68px] items-center gap-3 px-4 py-3 active:bg-brand-100">
            <span class="grid size-11 shrink-0 place-items-center rounded-lg bg-brand-50">
              <img :src="g.emoji" alt="" width="32" height="32" class="size-8 object-contain" loading="lazy">
            </span>
            <span class="min-w-0 flex-1">
              <span class="block text-[1rem] font-bold text-ink">{{ g.title }}</span>
              <span class="block text-[0.875rem] leading-snug text-ink-2">{{ g.summary }}</span>
            </span>
            <AppIcon name="next" class="size-5 shrink-0 text-ink-2" />
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
