<script setup lang="ts">
// 3D 아이콘(PNG). 장식용이므로 대체 텍스트는 비워 두고, 뜻은 옆의 글자나 버튼의 aria-label이 전달합니다.
defineProps<{ name: string }>()
</script>

<template>
  <img :src="`/icons/${name}.png`" alt="" width="128" height="128" draggable="false" class="inline-block shrink-0 select-none object-contain">
</template>
