<script setup lang="ts">
import type { Business } from '~/data/businesses'
import { categoryMap } from '~/data/businesses'
import { toneBg } from '~/data/tones'

const props = defineProps<{
  business: Business
}>()

const category = computed(() => categoryMap[props.business.category])
</script>

<template>
  <NuxtLink
    :to="`/businesses/${business.slug}`"
    class="box3d lift group flex flex-col overflow-hidden rounded-lg border bg-white"
    :class="business.sponsored ? 'border-secondary ring-2 ring-secondary' : 'border-default'"
  >
    <div class="relative flex h-40 items-center justify-center" :class="toneBg[category.tone]">
      <img :src="category.emoji" alt="" class="size-24 transition-transform duration-300 group-hover:scale-110">
      <div class="absolute left-3 top-3 flex flex-wrap gap-1.5">
        <UBadge v-if="business.sponsored" label="추천 · 광고" color="secondary" variant="solid" />
        <UBadge v-if="business.example" label="예시" color="neutral" variant="solid" />
      </div>
    </div>

    <div class="flex flex-1 flex-col gap-2 p-5">
      <div class="flex items-center gap-2">
        <UBadge :label="category.label" color="primary" variant="subtle" />
        <span class="flex items-center gap-1 text-xs text-muted">
          <UIcon name="i-lucide-map-pin" class="size-3.5" />
          {{ business.area }}
        </span>
      </div>
      <h3 class="text-lg font-bold text-highlighted">
        {{ business.name }}
      </h3>
      <p class="text-sm leading-relaxed text-muted">
        {{ business.description }}
      </p>
    </div>
  </NuxtLink>
</template>
