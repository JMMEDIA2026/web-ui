<script setup lang="ts">
// 업체 사진: 옆으로 밀어서 넘겨 보는 갤러리. 대표 사진이 맨 앞입니다.
const props = defineProps<{ photos: string[], name: string }>()

const scroller = ref<HTMLElement | null>(null)
const index = ref(0)

function onScroll() {
  const el = scroller.value
  if (!el || !el.clientWidth) return
  index.value = Math.min(props.photos.length - 1, Math.max(0, Math.round(el.scrollLeft / el.clientWidth)))
}

function go(delta: number) {
  const el = scroller.value
  if (!el) return
  const target = Math.min(props.photos.length - 1, Math.max(0, index.value + delta))
  el.scrollTo({ left: target * el.clientWidth, behavior: 'smooth' })
}
</script>

<template>
  <div class="relative bg-ink" role="region" :aria-label="`${name} 사진 ${photos.length}장`">
    <div ref="scroller" class="no-scrollbar flex snap-x snap-mandatory overflow-x-auto" tabindex="0" @scroll.passive="onScroll" @keydown.left.prevent="go(-1)" @keydown.right.prevent="go(1)">
      <img
        v-for="(id, i) in photos"
        :key="id"
        :src="`/api/photos/${id}`"
        :alt="`${name} 사진 ${i + 1}`"
        class="aspect-video w-full shrink-0 snap-center object-cover"
        :loading="i === 0 ? 'eager' : 'lazy'"
        :fetchpriority="i === 0 ? 'high' : 'auto'"
        draggable="false"
      >
    </div>
    <p v-if="photos.length > 1" class="pointer-events-none absolute bottom-3 right-3 rounded-md bg-ink/70 px-2 py-1 text-[0.8125rem] font-bold text-white" aria-live="polite">
      {{ index + 1 }} / {{ photos.length }}
    </p>
    <template v-if="photos.length > 1">
      <button v-if="index > 0" type="button" class="absolute left-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/85" aria-label="이전 사진" @click="go(-1)">
        <AppIcon name="back" class="size-6" />
      </button>
      <button v-if="index < photos.length - 1" type="button" class="absolute right-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/85" aria-label="다음 사진" @click="go(1)">
        <AppIcon name="next" class="size-6" />
      </button>
    </template>
  </div>
</template>
