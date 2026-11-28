<script setup lang="ts">
import { TABLER } from '~/utils/tabler'

// 사이트 아이콘: Tabler Icons(MIT)의 얇은 선 아이콘. 글자색을 따라가고, 장식이라 낭독기는 읽지 않습니다.
// 뜻은 옆의 글자나 버튼의 aria-label이 전달합니다.
const props = defineProps<{ name: string }>()

// 화면에서 쓰는 이름 → Tabler 아이콘 이름
const ALIAS: Record<string, string> = {
  back: 'chevron-left',
  next: 'chevron-right',
  down: 'chevron-down',
  up: 'chevron-up',
  search: 'search',
  pin: 'map-pin',
  close: 'x',
  check: 'check',
  compass: 'compass',
  warning: 'alert-triangle',
  swap: 'arrows-up-down',
  refresh: 'refresh',
  map: 'map-2',
  list: 'list',
  locate: 'current-location',
  biz: 'building-store',
  calendar: 'calendar',
  megaphone: 'speakerphone',
  me: 'user',
  phone: 'phone',
  copy: 'copy',
  link: 'link',
  info: 'info-circle',
  star: 'star',
  chat: 'message-circle',
  home: 'home',
  book: 'book',
  flag: 'flag'
}
const body = computed(() => TABLER[ALIAS[props.name] ?? props.name] ?? '')
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" class="inline-block shrink-0" v-html="body" />
</template>
