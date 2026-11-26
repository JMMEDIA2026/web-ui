<script setup lang="ts">
import { contactHref, contactTypeMap } from '../../shared/utils/contact'
import type { ContactItem } from '../../shared/utils/contact'

// 등록된 연락처를 종류별로 보여 줍니다. 아이디 옆 "복사"를 누르면 바로 복사돼요.
defineProps<{ items: ContactItem[] }>()
const toast = useToast()

async function copy(item: ContactItem) {
  try {
    await navigator.clipboard.writeText(item.value.trim())
    toast.add({ title: `${contactTypeMap[item.type].label} 아이디를 복사했어요`, description: item.value.trim(), color: 'success' })
  } catch {
    toast.add({ title: '복사하지 못했어요', description: item.value.trim(), color: 'warning' })
  }
}
</script>

<template>
  <ul class="space-y-2">
    <li v-for="(c, i) in items" :key="`${c.type}-${i}`" class="rounded-2xl bg-fill px-3 py-2">
      <div class="flex items-center justify-between gap-2">
        <span class="inline-flex min-h-8 items-center gap-1 rounded-full px-2.5 text-[0.8125rem] font-bold" :class="contactTypeMap[c.type].chip">
          <span aria-hidden="true">{{ contactTypeMap[c.type].emoji }}</span>{{ contactTypeMap[c.type].label }}
        </span>
        <span class="flex shrink-0 gap-1.5">
          <a v-if="contactHref(c)" :href="contactHref(c)!" :target="contactHref(c)!.startsWith('tel:') ? undefined : '_blank'" rel="noopener" class="btn btn-outline btn-sm" :aria-label="`${contactTypeMap[c.type].label} ${c.type === 'phone' ? '전화 걸기' : '열기'}`">
            {{ c.type === 'phone' ? '전화' : '열기' }}
          </a>
          <button type="button" class="btn btn-quiet btn-sm" :aria-label="`${contactTypeMap[c.type].label} 아이디 복사`" @click="copy(c)">
            복사
          </button>
        </span>
      </div>
      <p class="mt-1 break-all text-[1.0625rem] font-bold text-ink">
        {{ c.value }}
      </p>
    </li>
  </ul>
</template>
