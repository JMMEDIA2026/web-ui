<script setup lang="ts">
import { guides } from '~/data/guides'
import { categories, categoryMap } from '~/data/businesses'

// 홈: 흰 바탕 + 파랑 포인트 화면.
// 위에서부터 검색 → 탭 → 배너 → 카테고리 → 환율 → 추천 업체 → 처음 오셨나요? → 바로가기
definePageMeta({ region: true, header: false })

useSeoMeta({
  title: '라자 · 라오스 자유 여행 생활 정보와 한인 업체',
  description: '라오스 한인과 방문자를 위한 생활 가이드, 환율 계산기, 주변 업체 찾기.'
})

const { region, regionKey } = useRegion()
const sheetOpen = useRegionSheet()
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

// 상단 탭: 같은 사이트 안의 큰 화면으로 가는 링크입니다.
const tabs = [
  { label: '홈', to: '/' },
  { label: '업체', to: '/businesses' },
  { label: '가이드', to: '/guides' },
  { label: '환율', to: '/exchange' }
]

// 관리자가 등록한 메인 배너(노출 중인 것만)
const { data: bannerData } = await useFetch<{ id: string, title: string, linkUrl: string, v: number }[]>('/api/banners', { key: 'banners', default: () => [] })
const banners = computed(() => bannerData.value ?? [])

// 환율은 실제 값을 불러온 경우에만 숫자를 보여 줍니다.
const { data: rates } = await useFetch<{ krwLak: number }>('/api/rates', { key: 'rates', default: () => null })
const fmtNum = (n: number) => n.toLocaleString('ko-KR', { maximumFractionDigits: 0 })

// 실제로 등록된 업체만 보여 줍니다. 광고(추천) 업체가 앞에 옵니다.
const { real } = await useBusinessList()
const ordered = computed(() => [...real.value].sort((a, b) => Number(!!b.sponsored) - Number(!!a.sponsored)))
const bizTabs = computed(() => {
  const keys = new Set(real.value.map(b => b.category))
  return categories.filter(c => keys.has(c.key))
})
const bizTab = ref('all')
const bizShown = computed(() => (bizTab.value === 'all' ? ordered.value : ordered.value.filter(b => b.category === bizTab.value)).slice(0, 10))

const firstGuides = ['visa', 'telecom', 'health', 'banking']
  .map(slug => guides.find(g => g.slug === slug))
  .filter((g): g is NonNullable<typeof g> => !!g)

// 바로가기 카드: 사이트에 실제로 있는 기능만 모았습니다.
const tools = [
  { label: '환율 변환', desc: '원·킵·달러 바로 계산', emoji: '💱', to: '/exchange', bg: 'bg-[#FFF4DD]' },
  { label: '업체 지도', desc: '내 주변 한인 업체', emoji: '🗺️', to: '/businesses', bg: 'bg-[#E7F6EC]' },
  { label: '예약 요청', desc: '미리 자리 맡기', emoji: '📅', to: '/reserve', bg: 'bg-[#E8EEFF]' },
  { label: '생활 가이드', desc: '비자·통신·병원', emoji: '🧭', to: '/guides', bg: 'bg-[#FDEBF1]' },
  { label: '업체 등록', desc: '무료로 올려요', emoji: '🏪', to: '/advertise', bg: 'bg-[#F0EAFE]' },
  { label: '회원 정보', desc: '등급과 예약 기록', emoji: '👤', to: '/me', bg: 'bg-[#EEF0F4]' }
]

// 맨 위로 버튼: 아래로 내려왔을 때만 보입니다.
const showTop = ref(false)
function onScroll() { showTop.value = window.scrollY > 500 }
onMounted(() => { window.addEventListener('scroll', onScroll, { passive: true }); onScroll() })
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
function toTop() {
  window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
}
</script>

<template>
  <div>
    <!-- 상단: 로고 + 파란 테두리 검색창 -->
    <header class="sticky top-0 z-30 bg-white/95 px-4 pb-2 backdrop-blur" style="padding-top: calc(10px + env(safe-area-inset-top, 0px))">
      <div class="flex items-center gap-2">
        <NuxtLink to="/" class="-ml-1 inline-flex min-h-11 shrink-0 items-center px-1" aria-label="라자 홈">
          <AppLogo :size="30" color="#3F4FE0" text-class="text-[1.375rem] text-ink" />
        </NuxtLink>
        <!-- 검색: 키보드의 검색 동작과 아이콘 버튼은 같은 결과를 실행합니다. -->
        <form class="relative min-w-0 flex-1" role="search" @submit.prevent="search">
          <label for="home-search" class="sr-only">업체 검색</label>
          <input
            id="home-search"
            v-model="q"
            type="search"
            enterkeyhint="search"
            autocomplete="off"
            placeholder="한식당, 마사지, 환전…"
            class="h-12 w-full rounded-full border-2 border-brand-500 bg-white pe-10 ps-3 text-[0.8125rem] text-ink placeholder:text-ink-2 focus-visible:outline-offset-2"
          >
          <button type="submit" class="absolute end-0.5 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full text-brand-500" aria-label="검색">
            <svg viewBox="0 0 24 24" class="size-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4.5 4.5" /></svg>
          </button>
        </form>
      </div>

      <!-- 탭: 지역 선택 + 큰 화면 바로가기 -->
      <nav class="no-scrollbar -mx-4 mt-2 flex items-center gap-1.5 overflow-x-auto px-4" aria-label="바로가기 탭">
        <button
          type="button"
          class="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-full bg-fill pe-2 ps-3 text-[0.875rem] font-bold text-ink"
          aria-haspopup="dialog"
          :aria-label="`지역 선택. 현재 ${region.label}`"
          @click="sheetOpen = true"
        >
          <span aria-hidden="true">📍</span>
          <span class="max-w-[7rem] truncate">{{ region.label }}</span>
          <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 9l6 6 6-6" /></svg>
        </button>
        <span class="mx-0.5 h-4 w-px shrink-0 bg-line" aria-hidden="true" />
        <NuxtLink
          v-for="t in tabs"
          :key="t.to"
          :to="t.to"
          class="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full px-3.5 text-[0.9375rem] font-bold"
          :class="t.to === '/' ? 'bg-ink text-white' : 'text-ink-2'"
          :aria-current="t.to === '/' ? 'page' : undefined"
        >
          {{ t.label }}
        </NuxtLink>
      </nav>
    </header>

    <div class="px-4 pt-3">
      <!-- 메인 배너(광고). 배너가 없으면 소개 카드가 대신 보입니다. -->
      <HomeBanner v-if="banners.length" :banners="banners" />
      <h1 data-page-title tabindex="-1" :class="banners.length ? 'sr-only' : 'relative overflow-hidden rounded-[20px] bg-gradient-to-br from-brand-500 to-brand-700 px-6 py-8 text-[1.75rem] font-extrabold leading-[1.25] text-white'">
        오늘도 편하게,<br>라오스 생활.
        <template v-if="!banners.length">
          <span class="mt-2 block max-w-[13rem] text-[0.9375rem] font-semibold leading-snug text-white/90">한인 업체·생활 가이드·환율을 한곳에서</span>
          <span class="pointer-events-none absolute -bottom-3 end-3 text-[5.5rem] leading-none opacity-95" aria-hidden="true">🌴</span>
        </template>
      </h1>

      <!-- 안내 줄: 사장님을 위한 무료 등록 -->
      <NuxtLink to="/advertise" class="mt-3 flex min-h-12 items-center gap-3 rounded-2xl bg-fill px-3 py-2 active:bg-brand-50">
        <span class="shrink-0 rounded-full bg-brand-500 px-2.5 py-1 text-[0.75rem] font-bold text-white">사장님</span>
        <span class="min-w-0 flex-1 truncate text-[0.9375rem] font-semibold text-ink">업체 등록은 무료예요</span>
        <svg viewBox="0 0 24 24" class="size-5 shrink-0 text-ink-2" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M9 5l7 7-7 7" /></svg>
      </NuxtLink>

      <!-- 주요 카테고리 -->
      <nav class="mt-5" aria-label="주요 카테고리">
        <ul class="grid grid-cols-4 gap-x-2 gap-y-4">
          <li v-for="s in shortcuts" :key="s.label">
            <NuxtLink :to="s.to" class="group flex flex-col items-center gap-1.5 text-center">
              <span class="grid size-[68px] place-items-center rounded-[22px] border border-line bg-fill transition-transform group-active:scale-95">
                <img :src="s.emoji" alt="" width="40" height="40" class="size-10 object-contain" loading="lazy">
              </span>
              <span class="text-[0.8125rem] font-semibold leading-tight text-ink">{{ s.label }}</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- 오늘의 환율: 카드로 작게. 변환은 환율 화면에서 합니다. -->
      <NuxtLink to="/exchange" class="mt-6 flex min-h-[72px] items-center gap-3 rounded-[20px] border border-line bg-white px-4 py-3 shadow-[0_6px_20px_-10px_rgb(20_20_40/0.25)] active:bg-fill">
        <span class="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#FFF4DD] text-[1.5rem]" aria-hidden="true">💱</span>
        <span class="min-w-0 flex-1">
          <span class="block text-[0.8125rem] text-ink-2">오늘의 환율</span>
          <span v-if="rates" class="block text-[1.0625rem] font-extrabold text-ink">1,000원 = {{ fmtNum(1000 * rates.krwLak) }}킵</span>
          <span v-else class="block text-[1.0625rem] font-extrabold text-ink">환율 변환·환전업체 보기</span>
        </span>
        <span class="inline-flex shrink-0 items-center text-[0.875rem] font-bold text-brand-500">
          변환하기
          <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M9 5l7 7-7 7" /></svg>
        </span>
      </NuxtLink>

      <!-- 추천 업체: 업종 칩 + 가로로 넘기는 카드 -->
      <section class="mt-9" aria-labelledby="biz-title">
        <h2 id="biz-title" class="text-[1.375rem] font-extrabold text-ink">
          라자 추천 업체
        </h2>
        <template v-if="real.length">
          <div class="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4" role="group" aria-label="업종 고르기">
            <button type="button" class="inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-[0.9375rem] font-bold" :class="bizTab === 'all' ? 'bg-ink text-white' : 'bg-fill text-ink-2'" :aria-pressed="bizTab === 'all'" @click="bizTab = 'all'">
              전체
            </button>
            <button v-for="c in bizTabs" :key="c.key" type="button" class="inline-flex min-h-11 shrink-0 items-center rounded-full px-4 text-[0.9375rem] font-bold" :class="bizTab === c.key ? 'bg-ink text-white' : 'bg-fill text-ink-2'" :aria-pressed="bizTab === c.key" @click="bizTab = c.key">
              {{ c.label }}
            </button>
          </div>
          <ul class="no-scrollbar -mx-4 mt-3 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-1">
            <li v-for="b in bizShown" :key="b.slug" class="w-[210px] shrink-0 snap-start">
              <NuxtLink :to="`/businesses/${b.slug}`" class="block">
                <span class="relative block aspect-[4/3] overflow-hidden rounded-[18px] bg-fill">
                  <img v-if="b.photos?.length" :src="`/api/photos/${b.photos[0]}?size=thumb`" alt="" width="384" height="288" class="size-full object-cover" loading="lazy">
                  <span v-else class="grid size-full place-items-center">
                    <img :src="categoryMap[b.category]?.emoji" alt="" width="64" height="64" class="size-16 object-contain" loading="lazy">
                  </span>
                  <span v-if="b.sponsored" class="absolute start-2 top-2 rounded-full bg-white/95 px-2 py-0.5 text-[0.75rem] font-bold text-ink">광고</span>
                </span>
                <span class="mt-2 block truncate text-[1rem] font-bold text-ink">{{ b.name }}</span>
                <span class="block truncate text-[0.8125rem] text-ink-2">{{ categoryMap[b.category]?.label }} · {{ b.area || '비엔티안' }}</span>
              </NuxtLink>
            </li>
          </ul>
          <NuxtLink :to="{ path: '/businesses', query: { region: regionKey } }" class="mt-3 flex min-h-12 items-center justify-center gap-1 rounded-2xl border border-line text-[0.9375rem] font-bold text-ink active:bg-fill">
            <span>업체 전체보기</span>
          </NuxtLink>
        </template>
        <div v-else class="mt-3 rounded-[20px] bg-fill p-5 text-center">
          <p class="font-bold text-ink">
            아직 등록된 업체가 없어요
          </p>
          <p class="mt-1 text-[0.875rem] text-ink-2">
            사장님이라면 무료로 첫 업체를 등록해 보세요.
          </p>
          <NuxtLink to="/advertise" class="mt-3 inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-[0.9375rem] font-bold text-white">
            업체 등록 문의
          </NuxtLink>
        </div>
      </section>

      <!-- 처음 오셨나요?: 순서대로 보면 되는 가이드 -->
      <section class="mt-10" aria-labelledby="guide-title">
        <h2 id="guide-title" class="text-[1.375rem] font-extrabold text-ink">
          처음 오셨나요?
        </h2>
        <p class="mt-0.5 text-[0.875rem] text-ink-2">
          도착하면 이 순서로 보면 편해요
        </p>
        <ol class="mt-3">
          <li v-for="(g, i) in firstGuides" :key="g.slug">
            <NuxtLink :to="`/guides/${g.slug}`" class="flex min-h-[96px] items-center gap-4 py-3 active:opacity-70">
              <span class="w-7 shrink-0 text-center text-[2rem] font-black italic leading-none text-ink" aria-hidden="true">{{ i + 1 }}</span>
              <span class="min-w-0 flex-1">
                <span class="block text-[1.0625rem] font-bold text-ink">{{ g.title }}</span>
                <span class="mt-0.5 block text-[0.875rem] leading-snug text-ink-2">{{ g.summary }}</span>
              </span>
              <span class="grid size-[72px] shrink-0 place-items-center rounded-[18px] bg-fill">
                <img :src="g.emoji" alt="" width="44" height="44" class="size-11 object-contain" loading="lazy">
              </span>
            </NuxtLink>
          </li>
        </ol>
        <NuxtLink to="/guides" class="mt-1 flex min-h-12 items-center justify-center rounded-2xl border border-line text-[0.9375rem] font-bold text-ink active:bg-fill">
          가이드 모두 보기
        </NuxtLink>
      </section>

      <!-- 바로가기 모음: 사이트에 실제로 있는 기능 -->
      <section class="mt-10" aria-labelledby="tools-title">
        <h2 id="tools-title" class="text-[1.375rem] font-extrabold text-ink">
          라자 바로가기
        </h2>
        <ul class="mt-3 grid grid-cols-2 gap-3">
          <li v-for="t in tools" :key="t.label">
            <NuxtLink :to="t.to" class="flex min-h-[132px] flex-col justify-between rounded-[20px] p-4 active:opacity-80" :class="t.bg">
              <span class="text-[2.25rem] leading-none" aria-hidden="true">{{ t.emoji }}</span>
              <span>
                <span class="block text-[1.0625rem] font-extrabold text-ink">{{ t.label }}</span>
                <span class="block text-[0.8125rem] text-ink/70">{{ t.desc }}</span>
              </span>
            </NuxtLink>
          </li>
        </ul>
      </section>

      <p class="mt-8 text-center text-[0.8125rem] text-ink-2">
        업체를 운영하시나요?
        <NuxtLink to="/advertise" class="inline-flex min-h-11 items-center font-bold text-ink underline underline-offset-2">업체 등록·광고 문의</NuxtLink>
      </p>
    </div>

    <!-- 맨 위로 -->
    <button
      v-if="showTop"
      type="button"
      class="fixed end-4 z-30 grid size-12 place-items-center rounded-2xl border border-line bg-white text-ink shadow-[0_6px_18px_-6px_rgb(20_20_40/0.3)]"
      style="bottom: calc(92px + env(safe-area-inset-bottom, 0px))"
      aria-label="맨 위로"
      @click="toTop"
    >
      <svg viewBox="0 0 24 24" class="size-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 15l6-6 6 6" /></svg>
    </button>
  </div>
</template>
