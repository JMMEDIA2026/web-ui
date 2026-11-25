<script setup lang="ts">
import { guides } from '~/data/guides'

const route = useRoute()

const guide = guides.find(g => g.slug === route.params.slug)

if (!guide) {
  throw createError({ statusCode: 404, statusMessage: '가이드를 찾을 수 없습니다', fatal: true })
}

useSeoMeta({
  title: `${guide.title} · 라오스모아`,
  description: guide.summary
})
</script>

<template>
  <UContainer v-if="guide">
    <UPageHeader :title="guide.title" :description="guide.summary">
      <template #headline>
        <UBreadcrumb :items="[{ label: '생활 가이드', to: '/guides' }]" />
      </template>
    </UPageHeader>

    <UPageBody>
      <div class="grid gap-8 lg:grid-cols-3">
        <div class="lg:col-span-2 flex flex-col gap-6">
          <UAlert
            color="warning"
            variant="subtle"
            icon="i-lucide-construction"
            title="가이드를 준비하고 있습니다"
            description="제도 정보는 관할 기관의 최신 안내를 확인한 뒤 게시합니다. 아래는 담을 항목입니다."
          />

          <UCard>
            <template #header>
              <div class="flex items-center gap-3">
                <img :src="guide.emoji" alt="" class="size-10">
                <h2 class="font-semibold text-lg">
                  이 가이드에서 다룰 내용
                </h2>
              </div>
            </template>

            <ul class="flex flex-col gap-2">
              <li v-for="t in guide.topics" :key="t" class="flex items-center gap-2">
                <UIcon name="i-lucide-check" class="text-primary" />
                {{ t }}
              </li>
            </ul>
          </UCard>
        </div>

        <div class="flex flex-col gap-4">
          <AdSlot title="가이드 광고 자리" size="300×250" />
          <UButton to="/guides" label="목록으로" color="neutral" variant="outline" icon="i-lucide-arrow-left" />
        </div>
      </div>
    </UPageBody>
  </UContainer>
</template>
