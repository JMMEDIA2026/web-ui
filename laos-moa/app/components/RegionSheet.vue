<script setup lang="ts">
import { regions } from '~/data/regions'

const open = useRegionSheet()
const { regionKey, setRegion } = useRegion()

const panel = ref<HTMLElement | null>(null)
let opener: HTMLElement | null = null

function close() {
  open.value = false
}

function pick(key: string) {
  setRegion(key)
  close()
}

watch(open, async (isOpen) => {
  if (isOpen) {
    opener = document.activeElement as HTMLElement | null
    await nextTick()
    panel.value?.querySelector<HTMLElement>('button[aria-pressed="true"], button')?.focus()
  } else {
    opener?.focus?.()
  }
})

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-end justify-center" @keydown="onKey">
      <button type="button" class="absolute inset-0 bg-black/40" aria-label="지역 선택 닫기" tabindex="-1" @click="close" />
      <div
        ref="panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="region-sheet-title"
        class="relative w-full max-w-[560px] rounded-t-xl bg-white px-4 pt-5"
        style="padding-bottom: calc(20px + env(safe-area-inset-bottom, 0px))"
      >
        <div class="flex items-center justify-between">
          <h2 id="region-sheet-title" class="text-[1.25rem] font-bold text-ink">
            지역 선택
          </h2>
          <button type="button" class="grid size-11 place-items-center rounded-full text-ink-2" aria-label="닫기" @click="close">
            <AppIcon name="close" class="size-6" />
          </button>
        </div>
        <ul class="mt-2">
          <li v-for="r in regions" :key="r.key">
            <button
              type="button"
              class="flex min-h-14 w-full items-center justify-between rounded-lg px-3 text-left text-[1.0625rem]"
              :class="regionKey === r.key ? 'bg-brand-100 font-bold text-brand-600' : 'text-ink'"
              :aria-pressed="regionKey === r.key"
              @click="pick(r.key)"
            >
              {{ r.label }}
              <AppIcon v-if="regionKey === r.key" name="check" class="size-7" />
            </button>
          </li>
        </ul>
        <p class="mt-3 px-1 text-[0.8125rem] leading-snug text-ink-2">
          위치 권한 없이 직접 지역을 고르면 됩니다. 아직 등록된 업체가 없는 지역은 결과가 비어 있을 수 있어요.
        </p>
      </div>
    </div>
  </Teleport>
</template>
