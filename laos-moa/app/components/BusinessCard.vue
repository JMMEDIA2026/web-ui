<script setup lang="ts">
import type { Business } from '~/data/businesses'
import { categoryMap } from '~/data/businesses'

const props = defineProps<{
  business: Business
}>()

const category = computed(() => categoryMap[props.business.category])
</script>

<template>
  <UPageCard
    :to="`/businesses/${business.slug}`"
    :title="business.name"
    :description="business.description"
    variant="outline"
    :class="business.sponsored ? 'ring-2 ring-secondary' : ''"
  >
    <template #leading>
      <img :src="category.emoji" alt="" class="size-12">
    </template>

    <div class="flex flex-wrap items-center gap-2">
      <UBadge :label="category.label" color="primary" variant="subtle" />
      <UBadge :label="business.area" color="neutral" variant="outline" />
      <UBadge v-if="business.sponsored" label="추천 업체 · 광고" color="secondary" variant="solid" />
      <UBadge v-if="business.example" label="예시" color="neutral" variant="soft" />
    </div>
  </UPageCard>
</template>
