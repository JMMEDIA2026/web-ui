<script setup lang="ts">
// 아이콘. 방향·동작 아이콘(다음·뒤로·바꾸기·새로고침)은 글자색을 따르는 얇은 선 아이콘이고,
// 나머지는 3D 아이콘(PNG)입니다. 장식용이므로 대체 텍스트는 비워 두고,
// 뜻은 옆의 글자나 버튼의 aria-label이 전달합니다.
const props = defineProps<{ name: string }>()

const LINE: Record<string, string> = {
  next: 'M9 5l7 7-7 7',
  back: 'M15 5l-7 7 7 7',
  swap: 'M7 4v14m0 0l-3-3m3 3l3-3M17 20V6m0 0l-3 3m3-3l3 3',
  refresh: 'M20 12a8 8 0 10-2.34 5.66M20 5v5h-5'
}
const path = computed(() => LINE[props.name])
</script>

<template>
  <svg v-if="path" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" class="inline-block shrink-0">
    <path :d="path" />
  </svg>
  <img v-else :src="`/icons/${name}.png`" alt="" width="128" height="128" draggable="false" class="inline-block shrink-0 select-none object-contain">
</template>
