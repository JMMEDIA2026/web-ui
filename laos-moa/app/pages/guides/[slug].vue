<script setup lang="ts">
import { guides } from '~/data/guides'

const route = useRoute()
const router = useRouter()

const guide = guides.find(g => g.slug === route.params.slug)

if (!guide) {
  throw createError({ statusCode: 404, statusMessage: '가이드를 찾을 수 없습니다', fatal: true })
}

// 관련 업체 찾기: 가이드와 이어지는 업종이 있을 때만 보여 줍니다.
const relatedCategory: Record<string, string> = { health: 'hospital', banking: 'exchange' }
const related = relatedCategory[guide.slug]

function back() {
  if (router.options.history.state?.back) router.back()
  else navigateTo('/guides')
}

useSeoMeta({
  title: `${guide.title} · 라자`,
  description: guide.summary
})
</script>

<template>
  <div class="px-4 pt-3 sm:px-5">
    <div class="flex items-center gap-1">
      <button type="button" class="-ml-2 grid size-11 place-items-center rounded-full text-ink" aria-label="뒤로가기" @click="back">
        <AppIcon name="back" class="size-7" />
      </button>
      <p class="text-[0.9375rem] font-semibold text-ink-2">
        생활 가이드
      </p>
    </div>

    <div class="mt-2 flex items-center gap-3">
      <span class="grid size-14 shrink-0 place-items-center rounded-lg bg-brand-50">
        <img :src="guide.emoji" alt="" width="40" height="40" class="size-10 object-contain">
      </span>
      <h1 data-page-title tabindex="-1" class="text-[1.625rem] font-bold leading-tight text-ink">
        {{ guide.title }}
      </h1>
    </div>
    <p class="mt-2 text-[1rem] leading-relaxed text-ink-2">
      {{ guide.summary }}
    </p>

    <!-- 내용을 아직 확인해 싣지 못한 가이드는 솔직하게 알립니다. -->
    <section class="card mt-5 p-4" aria-labelledby="status-title">
      <h2 id="status-title" class="flex items-center gap-2 text-[1.0625rem] font-bold text-ink">
        <AppIcon name="info" class="size-5 text-brand-600" />
        내용을 확인하고 있어요
      </h2>
      <p class="mt-1 text-[0.9375rem] leading-relaxed text-ink-2">
        제도와 요금 정보는 관할 기관의 최신 안내를 확인한 뒤 올립니다. 아래 항목을 차례로 정리하고 있어요.
      </p>
    </section>

    <section class="card mt-3 p-4" aria-labelledby="topics-title">
      <h2 id="topics-title" class="text-[1.125rem] font-bold text-ink">
        이 가이드에서 다룰 내용
      </h2>
      <ul class="mt-3 space-y-3">
        <li v-for="t in guide.topics" :key="t" class="flex items-center gap-3 text-[1rem] text-ink">
          <AppIcon name="check" class="size-5 shrink-0 text-brand-500" />
          {{ t }}
        </li>
      </ul>
    </section>

    <NuxtLink v-if="related" :to="{ path: '/businesses', query: { category: related } }" class="btn btn-primary mt-4 w-full">
      <AppIcon name="pin" class="size-5" />
      관련 업체 찾기
    </NuxtLink>
  </div>
</template>
