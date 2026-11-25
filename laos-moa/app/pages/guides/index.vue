<script setup lang="ts">
import { guides } from '~/data/guides'

useSeoMeta({
  title: '생활 가이드 · 라오스모아',
  description: '비자, 면허, 통신, 병원, 대사관, 은행까지 라오스 생활 가이드.'
})
</script>

<template>
  <UContainer>
    <UPageHeader title="생활 가이드" description="처음 오셔도 막히지 않도록 단계별로 정리합니다." />

    <UPageBody>
      <UPageGrid class="lg:grid-cols-3">
        <UPageCard
          v-for="g in guides"
          :key="g.slug"
          :to="`/guides/${g.slug}`"
          :title="g.title"
          :description="g.summary"
          variant="outline"
        >
          <template #leading>
            <img :src="g.emoji" alt="" class="size-12">
          </template>
        </UPageCard>
      </UPageGrid>
    </UPageBody>
  </UContainer>
</template>
