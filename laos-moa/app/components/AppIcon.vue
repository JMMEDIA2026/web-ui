<script setup lang="ts">
// 3D 아이콘(PNG). 장식용이므로 대체 텍스트는 비워 두고, 뜻은 옆의 글자나 버튼의 aria-label이 전달합니다.
const props = defineProps<{ name: string }>()

// 파란색 3D 아이콘(화살표·새로고침·바꾸기)은 브랜드 녹색에 맞춰 색을 돌립니다.
const tinted = computed(() => ['next', 'back', 'swap', 'refresh'].includes(props.name))
</script>

<template>
  <img :src="`/icons/${name}.png`" alt="" width="128" height="128" draggable="false" class="inline-block shrink-0 select-none object-contain" :class="tinted ? 'icon-brand-tint' : ''">
</template>
