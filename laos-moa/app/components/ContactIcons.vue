<script setup lang="ts">
import { contactHref, contactTypeMap } from '../../shared/utils/contact'
import type { ContactItem } from '../../shared/utils/contact'

// 연락처를 로고 아이콘만 한 줄로 보여 줍니다. 아이콘을 누르면 아래에 아이디(번호)와
// [열기]·[복사] 버튼이 나와요. 아이콘은 최대 5개이고 줄바꿈 없이 한 줄에 들어갑니다.
const props = defineProps<{ items: ContactItem[] }>()
const toast = useToast()

const selected = ref(0)
const current = computed(() => props.items[Math.min(selected.value, props.items.length - 1)])
const info = computed(() => contactTypeMap[current.value.type])
const href = computed(() => contactHref(current.value))

async function copy() {
  const value = current.value.value.trim()
  try {
    await navigator.clipboard.writeText(value)
    toast.add({ title: `${info.value.label} 아이디를 복사했어요`, description: value, color: 'success' })
  } catch {
    toast.add({ title: '복사하지 못했어요', description: value, color: 'warning' })
  }
}
</script>

<template>
  <div>
    <div class="flex flex-nowrap items-center gap-2" role="group" aria-label="연락 방법 고르기">
      <button
        v-for="(c, i) in items"
        :key="`${c.type}-${i}`"
        type="button"
        class="grid size-11 shrink-0 place-items-center rounded-2xl border-2 bg-white transition-colors"
        :class="i === selected ? 'border-ink' : 'border-transparent bg-fill'"
        :aria-label="contactTypeMap[c.type].label"
        :aria-pressed="i === selected"
        @click="selected = i"
      >
        <SnsIcon :type="c.type" class="size-7" />
      </button>
    </div>

    <!-- 고른 연락처: 아이디와 버튼 -->
    <div class="mt-3 flex items-center gap-2 rounded-2xl bg-fill p-2 ps-3.5" aria-live="polite">
      <div class="min-w-0 flex-1">
        <p class="text-[0.8125rem] font-semibold text-ink-2">
          {{ info.label }}
        </p>
        <p class="break-all text-[1.0625rem] font-bold leading-snug text-ink">
          {{ current.value }}
        </p>
      </div>
      <a v-if="href" :href="href" :target="href.startsWith('tel:') ? undefined : '_blank'" rel="noopener" class="btn btn-outline btn-sm shrink-0" :aria-label="`${info.label} ${current.type === 'phone' ? '전화 걸기' : '열기'}`">
        {{ current.type === 'phone' ? '전화' : '열기' }}
      </a>
      <button type="button" class="btn btn-primary btn-sm shrink-0" :aria-label="`${info.label} 아이디 복사`" @click="copy">
        복사
      </button>
    </div>
  </div>
</template>
