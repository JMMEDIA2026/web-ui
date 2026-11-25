<script setup lang="ts">
import { businesses, categories } from '~/data/businesses'
import { guides } from '~/data/guides'
import { toneBg } from '~/data/tones'

useSeoMeta({
  title: '라오스모아 · 라오스 한인 생활 정보',
  description: '비엔티안 한인을 위한 생활 가이드와 한인 업체 디렉토리.'
})

const featured = businesses.slice(0, 3)
const [mainGuide, ...otherGuides] = guides

const q = ref('')

function onSearch() {
  const keyword = q.value.trim()
  navigateTo({ path: '/businesses', query: keyword ? { q: keyword } : {} })
}

const quickLinks = [
  { label: '한식당', to: '/businesses?category=food' },
  { label: '병원·약국', to: '/businesses?category=hospital' },
  { label: '렌트', to: '/businesses?category=rent' },
  { label: '마트·환전', to: '/businesses?category=mart' }
]

const promises = [
  { emoji: '/emoji/embassy.png', tone: 'sky', title: '한국어로 바로 이해', text: '영어나 라오어를 몰라도 읽을 수 있도록 한국어로 정리합니다.' },
  { emoji: '/emoji/visa.png', tone: 'peach', title: '확인한 정보만 게시', text: '제도 정보는 관할 기관의 최신 안내를 확인한 내용만 싣습니다.' },
  { emoji: '/emoji/job.png', tone: 'mint', title: '업체 등록은 무료', text: '한인 업체라면 누구나 무료로 등록하고 고객에게 알릴 수 있습니다.' }
] as const
</script>

<template>
  <div>
    <!-- 히어로 -->
    <section>
      <UContainer class="grid items-center gap-12 py-12 sm:py-16 lg:grid-cols-12 lg:py-20">
        <div class="lg:col-span-6">
          <UBadge label="비엔티안 한인 커뮤니티" color="primary" variant="subtle" size="lg" />
          <h1 class="mt-5 text-4xl font-extrabold leading-[1.2] tracking-tight text-highlighted sm:text-5xl">
            라오스 생활,<br>
            한인끼리 <span class="text-primary">묻고 나눕니다.</span>
          </h1>
          <p class="mt-5 max-w-md text-base leading-relaxed text-muted sm:text-lg">
            비자부터 병원, 한식당, 렌트까지. 먼저 정착한 한인의 정보를 한곳에 모았습니다.
          </p>

          <form class="mt-8 flex max-w-lg gap-2" role="search" @submit.prevent="onSearch">
            <UInput
              v-model="q"
              icon="i-lucide-search"
              size="xl"
              placeholder="업체명이나 키워드를 검색하세요"
              class="flex-1"
              :ui="{ base: 'bg-white' }"
              aria-label="업체 검색"
            />
            <UButton type="submit" size="xl" label="검색" />
          </form>

          <div class="mt-5 flex flex-wrap items-center gap-2">
            <span class="text-sm text-muted">바로가기</span>
            <NuxtLink
              v-for="l in quickLinks"
              :key="l.label"
              :to="l.to"
              class="box3d border border-default bg-white px-3 py-1 text-sm font-medium text-default transition-colors hover:border-primary hover:text-primary"
            >
              {{ l.label }}
            </NuxtLink>
          </div>
        </div>

        <div class="relative px-3 lg:col-span-6">
          <div class="box3d bg-tone-sky p-3 sm:p-4">
            <img
              src="/images/sunset.jpg"
              alt="비엔티안 메콩강의 석양"
              class="aspect-[4/3] w-full object-cover"
            >
          </div>

          <div class="absolute -left-1 bottom-8 flex items-center gap-3 box3d border border-default bg-white py-2 pl-2 pr-4 sm:-left-5">
            <span class="flex size-12 items-center justify-center bg-tone-peach"><img src="/emoji/food.png" alt="" class="size-9"></span>
            <span class="text-sm font-bold">한식당<span class="block text-xs font-normal text-muted">메뉴·위치</span></span>
          </div>
          <div class="absolute -right-1 top-10 flex items-center gap-3 box3d border border-default bg-white py-2 pl-2 pr-4 sm:-right-4">
            <span class="flex size-12 items-center justify-center bg-tone-pink"><img src="/emoji/hospital.png" alt="" class="size-9"></span>
            <span class="text-sm font-bold">병원·약국<span class="block text-xs font-normal text-muted">한국어 진료</span></span>
          </div>
          <img src="/emoji/sun.png" alt="" class="absolute -top-6 left-6 size-20 sm:left-10 sm:size-24">
        </div>
      </UContainer>
    </section>

    <!-- 카테고리 -->
    <section class="py-16 sm:py-20">
      <UContainer>
        <div class="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 class="section-title text-2xl font-extrabold tracking-tight text-highlighted sm:text-3xl">
              지금 필요한 정보
            </h2>
            <p class="mt-2 text-muted">
              자주 찾는 분야부터 바로 들어가세요.
            </p>
          </div>
        </div>

        <div class="grid grid-cols-4 gap-2 sm:gap-4 lg:grid-cols-7">
          <NuxtLink
            v-for="c in categories"
            :key="c.key"
            :to="`/businesses?category=${c.key}`"
            class="box3d lift group flex flex-col items-center gap-2 rounded-lg px-2 py-4 text-center sm:gap-3 sm:px-3 sm:py-7"
            :class="toneBg[c.tone]"
          >
            <img :src="c.emoji" alt="" class="size-10 transition-transform duration-300 group-hover:scale-110 sm:size-20">
            <span>
              <span class="block text-xs font-bold text-highlighted sm:text-base">{{ c.label }}</span>
              <span class="mt-0.5 hidden text-xs text-default/70 sm:block">{{ c.description }}</span>
            </span>
          </NuxtLink>
        </div>
      </UContainer>
    </section>

    <!-- 오늘의 환율 -->
    <section class="pb-16 sm:pb-20">
      <UContainer>
        <div class="grid gap-5 lg:grid-cols-12">
          <RateWidget class="lg:col-span-7" />
          <NuxtLink to="/exchange" class="box3d lift group flex flex-col justify-between gap-6 rounded-lg bg-tone-sun p-7 lg:col-span-5">
            <div>
              <UBadge label="환전" color="neutral" variant="solid" />
              <h3 class="mt-3 text-2xl font-extrabold text-highlighted">
                한인 환전업체 찾기
              </h3>
              <p class="mt-2 text-sm leading-relaxed text-default/70">
                환율은 환전소마다 다릅니다. 위치와 영업시간을 확인하고 비교해 보세요.
              </p>
            </div>
            <div class="flex items-end justify-between">
              <span class="inline-flex items-center gap-1 text-sm font-bold text-primary">
                환전소 보기
                <UIcon name="i-lucide-arrow-right" class="size-4" />
              </span>
              <img src="/emoji/exchange.png" alt="" class="size-24 transition-transform duration-300 group-hover:scale-110">
            </div>
          </NuxtLink>
        </div>
      </UContainer>
    </section>

    <UContainer>
      <AdSlot />
    </UContainer>

    <!-- 한인 업체 -->
    <section class="py-16 sm:py-20">
      <UContainer>
        <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 class="section-title text-2xl font-extrabold tracking-tight text-highlighted sm:text-3xl">
              한인 업체
            </h2>
            <p class="mt-2 text-muted">
              한인이 운영하거나 한인이 자주 찾는 곳을 모읍니다.
            </p>
          </div>
          <UButton to="/businesses" label="전체 보기" color="neutral" variant="outline" trailing-icon="i-lucide-arrow-right" />
        </div>

        <div class="grid gap-5 md:grid-cols-3">
          <BusinessCard v-for="b in featured" :key="b.slug" :business="b" />
        </div>
      </UContainer>
    </section>

    <!-- 약속 3가지 -->
    <section class="border-y border-default py-16 sm:py-20">
      <UContainer>
        <h2 class="section-title text-center text-2xl font-extrabold tracking-tight text-highlighted sm:text-3xl">
          라오스모아가 지키는 약속
        </h2>
        <div class="mt-10 grid gap-5 md:grid-cols-3">
          <div v-for="p in promises" :key="p.title" class="box3d flex flex-col items-start gap-4 border border-default bg-white p-7">
            <span class="flex size-16 items-center justify-center" :class="toneBg[p.tone]"><img :src="p.emoji" alt="" class="size-12"></span>
            <h3 class="text-lg font-bold text-highlighted">
              {{ p.title }}
            </h3>
            <p class="text-sm leading-relaxed text-muted">
              {{ p.text }}
            </p>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- 생활 가이드 -->
    <section class="py-16 sm:py-20">
      <UContainer>
        <div class="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 class="section-title text-2xl font-extrabold tracking-tight text-highlighted sm:text-3xl">
              생활 가이드
            </h2>
            <p class="mt-2 text-muted">
              처음 오셔도 막히지 않도록 단계별로 정리합니다.
            </p>
          </div>
          <UButton to="/guides" label="전체 보기" color="neutral" variant="outline" trailing-icon="i-lucide-arrow-right" />
        </div>

        <div class="grid gap-4 lg:grid-cols-3">
          <GuideCard v-if="mainGuide" :guide="mainGuide" featured />
          <GuideCard v-for="g in otherGuides" :key="g.slug" :guide="g" />
        </div>
      </UContainer>
    </section>

    <!-- 라오스 둘러보기 -->
    <section class="pb-16 sm:pb-20">
      <UContainer>
        <div class="mb-8">
          <h2 class="section-title text-2xl font-extrabold tracking-tight text-highlighted sm:text-3xl">
            라오스 둘러보기
          </h2>
          <p class="mt-2 text-muted">
            비엔티안의 대표 명소를 소개합니다.
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-3 sm:grid-rows-2">
          <figure class="relative overflow-hidden sm:col-span-2 sm:row-span-2">
            <img src="/images/thatluang.jpg" alt="비엔티안 탓루앙 사원" loading="lazy" class="h-full min-h-64 w-full object-cover">
            <figcaption class="absolute bottom-0 left-0 bg-white px-4 py-2 text-sm font-bold">
              탓루앙 (Pha That Luang)
            </figcaption>
          </figure>
          <figure class="relative overflow-hidden">
            <img src="/images/patuxai.jpg" alt="비엔티안 빠뚜싸이 개선문" loading="lazy" class="aspect-[4/3] h-full w-full object-cover">
            <figcaption class="absolute bottom-0 left-0 bg-white px-4 py-2 text-sm font-bold">
              빠뚜싸이 (Patuxai)
            </figcaption>
          </figure>
          <figure class="relative overflow-hidden">
            <img src="/images/sunset.jpg" alt="메콩강의 석양" loading="lazy" class="aspect-[4/3] h-full w-full object-cover">
            <figcaption class="absolute bottom-0 left-0 bg-white px-4 py-2 text-sm font-bold">
              메콩강의 석양
            </figcaption>
          </figure>
        </div>
      </UContainer>
    </section>

    <!-- 업체 CTA -->
    <section class="pb-4">
      <UContainer>
        <div class="box3d relative overflow-hidden bg-primary px-6 py-12 text-white sm:px-12 sm:py-16">
          <div class="lao-band absolute inset-x-0 top-0 h-3" aria-hidden="true" />
          <div class="relative z-10 max-w-xl">
            <p class="text-sm font-bold text-tone-sun">
              업체 사장님께
            </p>
            <h2 class="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">
              한인 고객에게<br>우리 가게를 알리세요.
            </h2>
            <p class="mt-4 text-white/85">
              무료 등록부터 추천 업체, 배너 광고까지 안내해 드립니다.
            </p>
            <div class="mt-7 flex flex-wrap gap-3">
              <UButton to="/advertise#inquiry" label="광고·제휴 문의" color="secondary" size="xl" trailing-icon="i-lucide-arrow-right" />
              <UButton to="/advertise" label="이용 안내 보기" color="neutral" variant="outline" size="xl" class="bg-white" />
            </div>
          </div>
          <img src="/emoji/chat.png" alt="" class="absolute -bottom-6 right-4 size-40 sm:right-16 sm:size-64">
        </div>
      </UContainer>
    </section>
  </div>
</template>
