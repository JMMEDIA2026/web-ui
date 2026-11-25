<script setup lang="ts">
import { guides } from '~/data/guides'

useSeoMeta({
  title: '생활 가이드 · 라오스모아',
  description: '비자, 면허, 통신, 병원, 대사관, 은행까지 라오스 생활 가이드.'
})

const [mainGuide, ...otherGuides] = guides
</script>

<template>
  <div>
    <section class="border-b border-default bg-tone-cream">
      <UContainer class="py-12 sm:py-14">
        <h1 class="text-3xl font-extrabold tracking-tight text-highlighted sm:text-4xl">
          생활 가이드
        </h1>
        <p class="mt-2 text-muted">
          처음 오셔도 막히지 않도록 단계별로 정리합니다.
        </p>
      </UContainer>
    </section>

    <UContainer class="py-10">
      <div class="grid gap-4 lg:grid-cols-3">
        <GuideCard v-if="mainGuide" :guide="mainGuide" featured />
        <GuideCard v-for="g in otherGuides" :key="g.slug" :guide="g" />
      </div>
    </UContainer>
  </div>
</template>
