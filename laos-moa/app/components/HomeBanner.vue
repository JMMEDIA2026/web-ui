<script setup lang="ts">
// 메인 배너 슬라이드(광고). 옆으로 밀거나 점을 눌러 넘기고, 자동 넘김은 멈춤 버튼으로 끌 수 있습니다.
interface Banner { id: string, title: string, linkUrl: string, v: number }
const props = defineProps<{ banners: Banner[] }>()

const scroller = ref<HTMLElement | null>(null)
const index = ref(0)
const playing = ref(true)
const hovering = ref(false)
const reduced = ref(false)
let timer: ReturnType<typeof setInterval> | undefined

const count = computed(() => props.banners.length)

function onScroll() {
  const el = scroller.value
  if (!el || !el.clientWidth) return
  index.value = Math.min(count.value - 1, Math.max(0, Math.round(el.scrollLeft / el.clientWidth)))
}

function goTo(i: number, smooth = true) {
  const el = scroller.value
  if (!el) return
  el.scrollTo({ left: i * el.clientWidth, behavior: smooth && !reduced.value ? 'smooth' : 'auto' })
}

function next() {
  goTo((index.value + 1) % count.value)
}

function start() {
  stop()
  if (count.value > 1 && playing.value && !reduced.value) timer = setInterval(() => { if (!hovering.value) next() }, 5000)
}
function stop() {
  if (timer) clearInterval(timer)
  timer = undefined
}

onMounted(() => {
  reduced.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced.value) playing.value = false
  start()
})
onBeforeUnmount(stop)
watch(playing, start)

// 클릭 수는 사이트가 직접 세어 관리자에게 보여 줍니다. (실패해도 이동은 막지 않음)
function countClick(b: Banner) {
  try {
    navigator.sendBeacon?.(`/api/banners/${b.id}/click`)
  } catch {
    // 무시
  }
}

const isExternal = (url: string) => /^https:\/\//i.test(url)

// 사이트 안 주소는 화면 이동 컴포넌트로, 바깥 주소는 일반 링크로 엽니다.
const NuxtLinkComponent = resolveComponent('NuxtLink')
</script>

<template>
  <section class="relative overflow-hidden rounded-lg bg-brand-50" aria-roledescription="carousel" aria-label="광고 배너" @mouseenter="hovering = true" @mouseleave="hovering = false" @focusin="hovering = true" @focusout="hovering = false">
    <div ref="scroller" class="no-scrollbar flex snap-x snap-mandatory overflow-x-auto" @scroll.passive="onScroll" @touchstart.passive="hovering = true" @touchend.passive="hovering = false">
      <div v-for="(b, i) in banners" :key="b.id" class="relative aspect-[2/1] w-full shrink-0 snap-center" :inert="i !== index ? true : null" role="group" aria-roledescription="slide" :aria-label="`${i + 1} / ${count}`">
        <component
          :is="b.linkUrl ? (isExternal(b.linkUrl) ? 'a' : NuxtLinkComponent) : 'div'"
          v-bind="b.linkUrl ? (isExternal(b.linkUrl) ? { href: b.linkUrl, target: '_blank', rel: 'noopener sponsored' } : { to: b.linkUrl }) : {}"
          class="block size-full"
          @click="b.linkUrl && countClick(b)"
        >
          <img
            :src="`/api/banners/${b.id}/image?v=${b.v}`"
            :alt="`광고: ${b.title}`"
            class="size-full object-cover"
            width="1200"
            height="600"
            :loading="i === 0 ? 'eager' : 'lazy'"
            :fetchpriority="i === 0 ? 'high' : 'auto'"
            draggable="false"
          >
        </component>
        <span class="pointer-events-none absolute left-2 top-2 rounded-md bg-ink/70 px-1.5 py-0.5 text-[0.75rem] font-bold text-white">광고</span>
      </div>
    </div>

    <div v-if="count > 1" class="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between px-1">
      <!-- 5개를 넘으면 점이 한 줄을 넘치므로 "3 / 8" 숫자로 보여 줍니다. -->
      <p v-if="count > 5" class="pointer-events-none ml-2 rounded-md bg-ink/70 px-2 py-1 text-[0.8125rem] font-bold text-white" aria-live="off">
        {{ index + 1 }} / {{ count }}
      </p>
      <div v-else class="pointer-events-auto flex items-center">
        <button
          v-for="(b, i) in banners"
          :key="b.id"
          type="button"
          class="grid size-11 place-items-center"
          :aria-label="`${i + 1}번 배너 보기`"
          :aria-current="i === index"
          @click="goTo(i)"
        >
          <span class="block h-2.5 rounded-full ring-1 ring-ink/50 shadow-[0_0_3px_rgb(0_0_0/0.6)] transition-all" :class="i === index ? 'w-6 bg-surface' : 'w-2.5 bg-white/60'" />
        </button>
      </div>
      <button type="button" class="pointer-events-auto grid size-11 place-items-center" :aria-label="playing ? '자동 넘김 멈춤' : '자동 넘김 시작'" @click="playing = !playing">
        <span class="grid size-8 place-items-center rounded-full bg-ink/60 text-white">
          <svg v-if="playing" viewBox="0 0 24 24" class="size-4" fill="currentColor" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
          <svg v-else viewBox="0 0 24 24" class="size-4" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
        </span>
      </button>
    </div>
  </section>
</template>
