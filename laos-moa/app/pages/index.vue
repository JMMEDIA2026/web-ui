<script setup lang="ts">
import { businesses, categories } from '~/data/businesses'
import { guides } from '~/data/guides'

useSeoMeta({
  title: '라오스모아 · 라오스 한인 생활 정보',
  description: '비엔티안 한인을 위한 생활 가이드와 한인 업체 디렉토리.'
})

const featured = businesses.slice(0, 3)
</script>

<template>
  <div>
    <UPageHero
      headline="비엔티안 한인 커뮤니티"
      title="라오스 생활, 한인끼리 묻고 나눕니다."
      description="비자부터 병원, 한식당, 렌트까지. 먼저 정착한 한인의 정보를 한곳에 모았습니다."
      orientation="horizontal"
      :links="[
        { label: '한인 업체 찾기', to: '/businesses', icon: 'i-lucide-store', size: 'xl' },
        { label: '생활 가이드 보기', to: '/guides', icon: 'i-lucide-book-open', color: 'neutral', variant: 'subtle', size: 'xl' }
      ]"
    >
      <img
        src="/images/sunset.jpg"
        alt="비엔티안 메콩강의 석양"
        class="w-full rounded-lg shadow-2xl ring ring-default"
      >
    </UPageHero>

    <UPageSection title="지금 필요한 정보" description="자주 찾는 분야부터 바로 들어가세요.">
      <UPageGrid class="lg:grid-cols-3">
        <UPageCard
          v-for="c in categories"
          :key="c.key"
          :to="`/businesses?category=${c.key}`"
          :title="c.label"
          :description="c.description"
          variant="outline"
        >
          <template #leading>
            <img :src="c.emoji" alt="" class="size-12">
          </template>
        </UPageCard>
      </UPageGrid>
    </UPageSection>

    <UContainer>
      <AdSlot />
    </UContainer>

    <UPageSection
      title="한인 업체"
      description="한인이 운영하거나 한인이 자주 찾는 곳을 모읍니다."
      :links="[{ label: '업체 전체 보기', to: '/businesses', color: 'neutral', variant: 'subtle', trailingIcon: 'i-lucide-arrow-right' }]"
    >
      <UPageGrid class="lg:grid-cols-3">
        <BusinessCard v-for="b in featured" :key="b.slug" :business="b" />
      </UPageGrid>
    </UPageSection>

    <UPageSection title="생활 가이드" description="처음 오셔도 막히지 않도록 단계별로 정리합니다.">
      <UPageGrid class="lg:grid-cols-3">
        <UPageCard
          v-for="g in guides"
          :key="g.slug"
          :to="`/guides/${g.slug}`"
          :title="g.title"
          :description="g.summary"
          variant="subtle"
        >
          <template #leading>
            <img :src="g.emoji" alt="" class="size-12">
          </template>
        </UPageCard>
      </UPageGrid>
    </UPageSection>

    <UPageSection title="라오스 둘러보기" description="비엔티안의 대표 명소를 소개합니다.">
      <div class="grid gap-6 sm:grid-cols-2">
        <figure class="flex flex-col gap-2">
          <img src="/images/thatluang.jpg" alt="비엔티안 탓루앙 사원" loading="lazy" class="aspect-[16/10] w-full rounded-lg object-cover ring ring-default">
          <figcaption class="text-sm font-medium">
            탓루앙 (Pha That Luang)
          </figcaption>
        </figure>
        <figure class="flex flex-col gap-2">
          <img src="/images/patuxai.jpg" alt="비엔티안 빠뚜싸이 개선문" loading="lazy" class="aspect-[16/10] w-full rounded-lg object-cover ring ring-default">
          <figcaption class="text-sm font-medium">
            빠뚜싸이 (Patuxai)
          </figcaption>
        </figure>
      </div>
    </UPageSection>

    <UPageSection>
      <UPageCTA
        title="사업장을 운영하시나요?"
        description="한인 고객에게 업체를 알리세요. 무료 등록부터 추천 업체, 배너 광고까지 안내해 드립니다."
        variant="solid"
        :links="[{ label: '광고·제휴 문의', to: '/advertise#inquiry', color: 'neutral', trailingIcon: 'i-lucide-arrow-right' }]"
      />
    </UPageSection>
  </div>
</template>
