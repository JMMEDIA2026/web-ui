<script setup lang="ts">
import type { Guide } from '~/data/guides'
import { toneBg } from '~/data/tones'

defineProps<{
  guide: Guide
  featured?: boolean
}>()
</script>

<template>
  <NuxtLink
    :to="`/guides/${guide.slug}`"
    class="lift group flex overflow-hidden rounded-lg border border-default"
    :class="[toneBg[guide.tone], featured ? 'min-h-72 flex-col justify-between p-8 sm:p-10 lg:col-span-2 lg:row-span-2' : 'items-center gap-4 p-5']"
  >
    <img
      :src="guide.emoji"
      alt=""
      class="shrink-0 transition-transform duration-300 group-hover:scale-110"
      :class="featured ? 'size-32 sm:size-40 self-end' : 'size-16'"
    >
    <div :class="featured ? 'max-w-sm' : 'min-w-0'">
      <UBadge v-if="featured" label="가장 많이 찾는 가이드" color="neutral" variant="solid" class="mb-3" />
      <h3 class="font-bold text-highlighted" :class="featured ? 'text-2xl sm:text-3xl' : 'text-base'">
        {{ guide.title }}
      </h3>
      <p class="mt-1 text-sm leading-relaxed text-default/70">
        {{ guide.summary }}
      </p>
      <span v-if="featured" class="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary">
        가이드 보기
        <UIcon name="i-lucide-arrow-right" class="size-4" />
      </span>
    </div>
  </NuxtLink>
</template>
