<script setup lang="ts">
import { guides } from '~/data/guides'
import { categories, categoryMap } from '~/data/businesses'
import type { PostListItem } from '~/data/community'

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
  { label: '커뮤니티', to: '/community' },
  { label: '가이드', to: '/guides' }
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

// 커뮤니티 새 글 3개
const { data: latest } = await useFetch<{ posts: PostListItem[] }>('/api/community/posts', { key: 'home-posts', query: { limit: 3 }, default: () => ({ posts: [] }) })

const firstGuides = ['visa', 'telecom', 'health', 'banking']
  .map(slug => guides.find(g => g.slug === slug))
  .filter((g): g is NonNullable<typeof g> => !!g)

// 바로가기 카드: 사이트에 실제로 있는 기능만 모았습니다.
const tools = [
  { label: '환율 변환', desc: '원·킵·달러 바로 계산', emoji: '💱', to: '/exchange', bg: 'bg-primary/10' },
  { label: '업체 지도', desc: '내 주변 한인 업체', emoji: '🗺️', to: '/businesses', bg: 'bg-[#ECFCCB]' },
  { label: '커뮤니티', desc: '후기·질문·꿀팁', emoji: '💬', to: '/community', bg: 'bg-primary/5' },
  { label: '생활 가이드', desc: '비자·통신·병원', emoji: '🧭', to: '/guides', bg: 'bg-[#FEF3C7]' },
  { label: '업체 등록', desc: '무료로 올려요', emoji: '🏪', to: '/advertise', bg: 'bg-[#E7E5E4]' },
  { label: '회원 정보', desc: '등급과 예약 기록', emoji: '👤', to: '/me', bg: 'bg-[#F5F5F4]' }
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
    <header class="sticky top-0 z-30 bg-default/95 px-4 pb-2 backdrop-blur" style="padding-top: calc(10px + env(safe-area-inset-top, 0px))">
      <div class="flex items-center gap-2">
        <NuxtLink to="/" class="-ml-1 inline-flex min-h-11 shrink-0 items-center px-1" aria-label="라자 홈">
          <AppLogo :size="30" color="#C2410C" text-class="text-[1.375rem] text-highlighted" />
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
            class="h-12 w-full rounded-md border-2 border-primary bg-default pe-10 ps-3 text-[0.8125rem] text-highlighted placeholder:text-muted focus-visible:outline-offset-2"
          >
          <button type="submit" class="absolute end-0.5 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-md text-primary" aria-label="검색">
            <AppIcon name="search" class="size-6" />
          </button>
        </form>
      </div>

      <!-- 탭: 지역 선택 + 큰 화면 바로가기 -->
      <nav class="no-scrollbar -mx-4 mt-2 flex items-center gap-1.5 overflow-x-auto px-4" aria-label="바로가기 탭">
        <button
          type="button"
          class="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-md bg-muted pe-2 ps-3 text-[0.875rem] font-bold text-highlighted"
          aria-haspopup="dialog"
          :aria-label="`지역 선택. 현재 ${region.label}`"
          @click="sheetOpen = true"
        >
          <span aria-hidden="true">📍</span>
          <span class="max-w-[5.5rem] truncate">{{ region.label }}</span>
          <AppIcon name="down" class="size-4" />
        </button>
        
        <NuxtLink
          v-for="t in tabs"
          :key="t.to"
          :to="t.to"
          class="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md px-2.5 text-[0.9375rem] font-bold"
          :class="t.to === '/' ? 'bg-inverted text-inverted' : 'text-muted'"
          :aria-current="t.to === '/' ? 'page' : undefined"
        >
          {{ t.label }}
        </NuxtLink>
      </nav>
    </header>

    <div class="px-4 pt-3">
      <!-- 메인 배너(광고). 배너가 없으면 소개 카드가 대신 보입니다. -->
      <HomeBanner v-if="banners.length" :banners="banners" />
      <h1 data-page-title tabindex="-1" :class="banners.length ? 'sr-only' : 'border-y border-default py-7'">
        <template v-if="!banners.length">
          <span class="block text-[0.75rem] font-bold uppercase tracking-[0.22em] text-primary">Laos · Life · Guide</span>
          <span class="mt-3 block font-serif text-[3.5rem] italic leading-[0.92] tracking-tight text-highlighted">Laos,<br>made easy.</span>
          <span class="mt-4 block text-[1.125rem] font-bold leading-snug text-highlighted">오늘도 편하게, 라오스 생활.</span>
          <span class="mt-1 block text-[0.9375rem] font-normal leading-snug text-muted">한인 업체·생활 가이드·환율을 한곳에서</span>
        </template>
        <template v-else>
          오늘도 편하게,<br>라오스 생활.
        </template>
      </h1>

      <!-- 안내 줄: 사장님을 위한 무료 등록 -->
      <NuxtLink to="/advertise" class="mt-3 flex min-h-12 items-center gap-3 rounded-2xl bg-muted px-3 py-2 active:bg-primary/5">
        <span class="shrink-0 rounded-md bg-primary px-2.5 py-1 text-[0.75rem] font-bold text-white">사장님</span>
        <span class="min-w-0 flex-1 truncate text-[0.9375rem] font-semibold text-highlighted">업체 등록은 무료예요</span>
        <AppIcon name="next" class="size-5 shrink-0 text-muted" />
      </NuxtLink>

      <!-- 주요 카테고리 -->
      <nav class="mt-5" aria-label="주요 카테고리">
        <ul class="grid grid-cols-4 gap-x-2 gap-y-4">
          <li v-for="s in shortcuts" :key="s.label">
            <NuxtLink :to="s.to" class="group flex flex-col items-center gap-1.5 text-center">
              <span class="grid size-[68px] place-items-center rounded-lg border border-default bg-muted lift group-hover:-translate-y-0.5 group-active:scale-95">
                <img :src="s.emoji" alt="" width="40" height="40" class="size-10 object-contain" loading="lazy">
              </span>
              <span class="text-[0.8125rem] font-semibold leading-tight text-highlighted">{{ s.label }}</span>
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- 오늘의 환율: 카드로 작게. 변환은 환율 화면에서 합니다. -->
      <NuxtLink to="/exchange" class="mt-6 flex min-h-[72px] items-center gap-3 rounded-lg border border-default bg-default px-4 py-3 lift">
        <span class="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-[1.5rem]" aria-hidden="true">💱</span>
        <span class="min-w-0 flex-1">
          <span class="block text-[0.8125rem] text-muted">오늘의 환율</span>
          <span v-if="rates" class="block text-[1.0625rem] font-extrabold text-highlighted">1,000원 = {{ fmtNum(1000 * rates.krwLak) }}킵</span>
          <span v-else class="block text-[1.0625rem] font-extrabold text-highlighted">환율 변환·환전업체 보기</span>
        </span>
        <span class="inline-flex shrink-0 items-center text-[0.875rem] font-bold text-primary">
          변환하기
          <AppIcon name="next" class="size-4" />
        </span>
      </NuxtLink>

      <!-- 추천 업체: 업종 칩 + 가로로 넘기는 카드 -->
      <section class="mt-9" aria-labelledby="biz-title">
        <p class="text-[0.6875rem] font-bold uppercase tracking-[0.22em] text-primary">Featured</p>
        <h2 id="biz-title" class="text-[1.375rem] font-extrabold text-highlighted">
          라자 추천 업체
        </h2>
        <template v-if="real.length">
          <div class="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4" role="group" aria-label="업종 고르기">
            <button type="button" class="inline-flex min-h-11 shrink-0 items-center rounded-md px-4 text-[0.9375rem] font-bold" :class="bizTab === 'all' ? 'bg-inverted text-inverted' : 'bg-muted text-muted'" :aria-pressed="bizTab === 'all'" @click="bizTab = 'all'">
              전체
            </button>
            <button v-for="c in bizTabs" :key="c.key" type="button" class="inline-flex min-h-11 shrink-0 items-center rounded-md px-4 text-[0.9375rem] font-bold" :class="bizTab === c.key ? 'bg-inverted text-inverted' : 'bg-muted text-muted'" :aria-pressed="bizTab === c.key" @click="bizTab = c.key">
              {{ c.label }}
            </button>
          </div>
          <ul class="no-scrollbar -mx-4 mt-3 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-1">
            <li v-for="b in bizShown" :key="b.slug" class="w-[210px] shrink-0 snap-start">
              <NuxtLink :to="`/businesses/${b.slug}`" class="block">
                <span class="relative block aspect-[4/3] overflow-hidden rounded-lg bg-muted lift">
                  <img v-if="b.photos?.length" :src="`/api/photos/${b.photos[0]}?size=thumb`" alt="" width="384" height="288" class="size-full object-cover" loading="lazy">
                  <img v-else :src="`/images/categories/${b.category}.jpg`" alt="" width="384" height="216" class="size-full object-cover" loading="lazy">
                  <span v-if="b.sponsored" class="absolute start-2 top-2 rounded-md bg-default/95 px-2 py-0.5 text-[0.75rem] font-bold text-highlighted">광고</span>
                </span>
                <span class="mt-2 block truncate text-[1rem] font-bold text-highlighted">{{ b.name }}</span>
                <span class="block truncate text-[0.8125rem] text-muted">{{ categoryMap[b.category]?.label }} · {{ b.area || '비엔티안' }}</span>
              </NuxtLink>
            </li>
          </ul>
          <NuxtLink :to="{ path: '/businesses', query: { region: regionKey } }" class="mt-3 flex min-h-12 items-center justify-center gap-1 rounded-2xl border border-default text-[0.9375rem] font-bold text-highlighted active:bg-muted">
            <span>업체 전체보기</span>
          </NuxtLink>
        </template>
        <div v-else class="mt-3 rounded-lg bg-muted p-5 text-center">
          <p class="font-bold text-highlighted">
            아직 등록된 업체가 없어요
          </p>
          <p class="mt-1 text-[0.875rem] text-muted">
            사장님이라면 무료로 첫 업체를 등록해 보세요.
          </p>
          <NuxtLink to="/advertise" class="mt-3 inline-flex min-h-11 items-center rounded-md bg-inverted px-5 text-[0.9375rem] font-bold text-white">
            업체 등록 문의
          </NuxtLink>
        </div>
      </section>

      <!-- 커뮤니티 새 글 -->
      <section class="mt-10" aria-labelledby="cm-title">
        <p class="text-[0.6875rem] font-bold uppercase tracking-[0.22em] text-primary">Community</p>
        <h2 id="cm-title" class="text-[1.375rem] font-extrabold text-highlighted">
          라자 커뮤니티
        </h2>
        <p class="mt-0.5 text-[0.875rem] text-muted">
          후기, 질문, 꿀팁을 나눠요
        </p>
        <ul v-if="latest?.posts.length" class="mt-1 divide-y divide-default">
          <li v-for="p in latest.posts" :key="p.id">
            <PostCard :post="p" />
          </li>
        </ul>
        <div v-else class="mt-3 rounded-lg bg-muted p-5 text-center">
          <p class="font-bold text-highlighted">
            <span aria-hidden="true">💬 </span>첫 글을 기다리고 있어요
          </p>
          <p class="mt-1 text-[0.875rem] text-muted">
            다녀온 곳 후기나 궁금한 점을 남겨 보세요.
          </p>
        </div>
        <NuxtLink to="/community" class="mt-3 flex min-h-12 items-center justify-center rounded-2xl border border-default text-[0.9375rem] font-bold text-highlighted active:bg-muted">
          커뮤니티 가기
        </NuxtLink>
      </section>

      <!-- 처음 오셨나요?: 순서대로 보면 되는 가이드 -->
      <section class="mt-10" aria-labelledby="guide-title">
        <p class="text-[0.6875rem] font-bold uppercase tracking-[0.22em] text-primary">Start here</p>
        <h2 id="guide-title" class="text-[1.375rem] font-extrabold text-highlighted">
          처음 오셨나요?
        </h2>
        <p class="mt-0.5 text-[0.875rem] text-muted">
          도착하면 이 순서로 보면 편해요
        </p>
        <ol class="mt-3">
          <li v-for="(g, i) in firstGuides" :key="g.slug">
            <NuxtLink :to="`/guides/${g.slug}`" class="flex min-h-[96px] items-center gap-4 py-3 active:opacity-70">
              <span class="w-8 shrink-0 text-center font-serif text-[2.75rem] font-normal italic leading-none text-primary" aria-hidden="true">{{ i + 1 }}</span>
              <span class="min-w-0 flex-1">
                <span class="block text-[1.0625rem] font-bold text-highlighted">{{ g.title }}</span>
                <span class="mt-0.5 block text-[0.875rem] leading-snug text-muted">{{ g.summary }}</span>
              </span>
              <span class="grid size-[72px] shrink-0 place-items-center rounded-lg bg-muted">
                <img :src="g.emoji" alt="" width="44" height="44" class="size-11 object-contain" loading="lazy">
              </span>
            </NuxtLink>
          </li>
        </ol>
        <NuxtLink to="/guides" class="mt-1 flex min-h-12 items-center justify-center rounded-2xl border border-default text-[0.9375rem] font-bold text-highlighted active:bg-muted">
          가이드 모두 보기
        </NuxtLink>
      </section>

      <!-- 바로가기 모음: 사이트에 실제로 있는 기능 -->
      <section class="mt-10" aria-labelledby="tools-title">
        <p class="text-[0.6875rem] font-bold uppercase tracking-[0.22em] text-primary">Shortcuts</p>
        <h2 id="tools-title" class="text-[1.375rem] font-extrabold text-highlighted">
          라자 바로가기
        </h2>
        <ul class="mt-3 grid grid-cols-2 gap-3">
          <li v-for="t in tools" :key="t.label">
            <NuxtLink :to="t.to" class="lift flex min-h-[132px] flex-col justify-between rounded-lg p-4" :class="t.bg">
              <span class="text-[2.25rem] leading-none" aria-hidden="true">{{ t.emoji }}</span>
              <span>
                <span class="block text-[1.0625rem] font-extrabold text-highlighted">{{ t.label }}</span>
                <span class="block text-[0.8125rem] text-highlighted/70">{{ t.desc }}</span>
              </span>
            </NuxtLink>
          </li>
        </ul>
      </section>

      <p class="mt-8 text-center text-[0.8125rem] text-muted">
        업체를 운영하시나요?
        <NuxtLink to="/advertise" class="inline-flex min-h-11 items-center font-bold text-highlighted underline underline-offset-2">업체 등록·광고 문의</NuxtLink>
      </p>
    </div>

    <!-- 맨 위로 -->
    <button
      v-if="showTop"
      type="button"
      class="fixed end-4 z-30 grid size-12 place-items-center rounded-2xl border border-default bg-default text-highlighted shadow-[0_6px_18px_-6px_rgb(20_20_40/0.3)]"
      style="bottom: calc(92px + env(safe-area-inset-bottom, 0px))"
      aria-label="맨 위로"
      @click="toTop"
    >
      <AppIcon name="up" class="size-6" />
    </button>
  </div>
</template>
