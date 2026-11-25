<script setup lang="ts">
import type { Business } from '~/data/businesses'
import { categoryMap } from '~/data/businesses'

const props = defineProps<{
  business: Business
  selected: boolean
  /** 사용자 위치를 알 때만 전달됩니다(km). */
  distance?: number | null
}>()

const emit = defineEmits<{ select: [slug: string] }>()

const toast = useToast()
const category = computed(() => categoryMap[props.business.category])
const located = computed(() => hasCoords(props.business))
const directions = computed(() => directionsUrl(props.business))
const contact = computed(() => contactAction(props.business.contact))

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.add({ title: '연락처를 복사했어요', color: 'success' })
  } catch {
    toast.add({ title: '복사하지 못했어요', description: text, color: 'warning' })
  }
}
</script>

<template>
  <li
    :id="`biz-${business.slug}`"
    class="border-l-4 px-4 py-3"
    :class="selected ? 'border-brand-500 bg-brand-100' : 'border-transparent bg-white'"
  >
    <button
      type="button"
      class="flex min-h-[88px] w-full gap-3 rounded-lg text-left"
      :aria-pressed="selected"
      :aria-label="`${business.name} 선택`"
      @click="emit('select', business.slug)"
    >
      <!-- 실제 업체 사진이 없으면 업종 아이콘만 보여 줍니다. 다른 업체 사진으로 대체하지 않습니다. -->
      <span class="grid size-[88px] shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
        <img v-if="category?.emoji" :src="category.emoji" alt="" width="56" height="56" class="size-14 object-contain" loading="lazy">
        <UIcon v-else name="i-lucide-store" class="size-9" />
      </span>
      <span class="min-w-0 flex-1">
        <span class="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span class="break-words text-[1.0625rem] font-bold leading-snug text-ink">{{ business.name }}</span>
          <span v-if="business.sponsored" class="rounded-md bg-brand-100 px-1.5 py-0.5 text-[0.75rem] font-bold text-brand-600">광고</span>
        </span>
        <span class="mt-0.5 block text-[0.875rem] text-ink-2">
          {{ category?.label }} · {{ business.area || '비엔티안' }}<template v-if="distance != null"> · {{ formatDistance(distance) }}</template>
        </span>
        <span v-if="business.hours" class="mt-1 block text-[0.875rem] text-ink">영업시간 {{ business.hours }}</span>
        <span v-if="!located" class="mt-1 inline-flex items-center gap-1 text-[0.8125rem] font-bold text-ink-2">
          <UIcon name="i-lucide-map-pin" class="size-4" />
          위치 확인 중
        </span>
      </span>
    </button>

    <div class="mt-2 flex flex-wrap gap-2">
      <NuxtLink :to="`/businesses/${business.slug}`" class="btn btn-quiet btn-sm">
        상세 보기
      </NuxtLink>
      <a v-if="directions" :href="directions" target="_blank" rel="noopener" class="btn btn-outline btn-sm">
        <UIcon name="i-lucide-navigation" class="size-4" />
        길찾기
      </a>
      <template v-if="contact">
        <a v-if="contact.kind === 'tel'" :href="contact.href" class="btn btn-outline btn-sm">
          <UIcon name="i-lucide-phone" class="size-4" />
          {{ contact.label }}
        </a>
        <a v-else-if="contact.kind === 'link'" :href="contact.href" target="_blank" rel="noopener" class="btn btn-outline btn-sm">
          <UIcon name="i-lucide-phone" class="size-4" />
          {{ contact.label }}
        </a>
        <button v-else type="button" class="btn btn-outline btn-sm" @click="copy(contact.text)">
          <UIcon name="i-lucide-copy" class="size-4" />
          {{ contact.label }}
        </button>
      </template>
    </div>
  </li>
</template>
