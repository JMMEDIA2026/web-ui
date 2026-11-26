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

// 목록 행에서는 좁은 칸에 맞춰 짧은 이름을 씁니다. (상세 화면에서는 "전화하기" 등 전체 이름)
const shortContactLabel = computed(() => contact.value?.short ?? '연락처')

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
    :class="selected ? 'border-brand-500 bg-brand-100' : 'border-transparent bg-surface'"
  >
    <!-- 사진·이름·정보를 누르면 바로 상세 화면으로 갑니다. -->
    <NuxtLink
      :to="`/businesses/${business.slug}`"
      class="flex min-h-[88px] w-full gap-3 rounded-lg text-left"
      :aria-current="selected ? 'true' : undefined"
      @click="emit('select', business.slug)"
    >
      <!-- 실제 업체 사진이 없으면 업종 아이콘만 보여 줍니다. 다른 업체 사진으로 대체하지 않습니다. -->
      <span class="grid h-[72px] w-[128px] shrink-0 place-items-center overflow-hidden rounded-lg bg-brand-50 text-brand-600">
        <img v-if="business.photos?.length" :src="`/api/photos/${business.photos[0]}?size=thumb`" alt="" width="128" height="72" class="size-full object-cover" loading="lazy">
        <img v-else :src="`/images/categories/${business.category}.jpg`" alt="" width="128" height="72" class="size-full object-cover" loading="lazy">
      </span>
      <span class="min-w-0 flex-1">
        <span class="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[0.8125rem] text-ink-2">
          <span v-if="business.sponsored" class="shrink-0 rounded-md bg-gold-50 px-1.5 py-0.5 text-[0.75rem] font-bold text-gold-700">광고</span>
          <span class="min-w-0">{{ category?.label }} · {{ business.area || '비엔티안' }}<template v-if="distance != null"> · {{ formatDistance(distance) }}</template></span>
        </span>
        <span class="mt-0.5 block break-words [overflow-wrap:anywhere] [text-wrap:balance] text-[1.0625rem] font-bold leading-snug text-ink">{{ business.name }}</span>
        <span v-if="business.hours" class="mt-1 block text-[0.875rem] text-ink">영업시간 {{ business.hours }}</span>
        <span v-if="!located" class="mt-1 inline-flex items-center gap-1 text-[0.8125rem] font-bold text-ink-2">
          <AppIcon name="pin" class="size-4" />
          위치 확인 중
        </span>
      </span>
    </NuxtLink>

    <div class="mt-2 grid gap-2" style="grid-template-columns: repeat(auto-fit, minmax(4.6rem, 1fr))">
      <a v-if="directions" :href="directions" target="_blank" rel="noopener" class="btn btn-outline btn-row">
        <AppIcon name="compass" class="size-4 shrink-0" />
        길찾기
      </a>
      <template v-if="contact">
        <a v-if="contact.kind === 'tel'" :href="contact.href" class="btn btn-outline btn-row">
          <AppIcon name="phone" class="size-4 shrink-0" />
          {{ shortContactLabel }}
        </a>
        <a v-else-if="contact.kind === 'link'" :href="contact.href" target="_blank" rel="noopener" class="btn btn-outline btn-row">
          <AppIcon name="phone" class="size-4 shrink-0" />
          {{ shortContactLabel }}
        </a>
        <button v-else type="button" class="btn btn-outline btn-row" @click="copy(contact.text)">
          <AppIcon name="copy" class="size-4 shrink-0" />
          {{ shortContactLabel }}
        </button>
      </template>
      <NuxtLink :to="{ path: '/reserve', query: { business: business.slug } }" class="btn btn-primary btn-row">
        예약 요청
      </NuxtLink>
    </div>
  </li>
</template>
