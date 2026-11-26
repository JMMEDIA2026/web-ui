<script setup lang="ts">
// 라자 로고: 보라색 핀 아이콘 + 글자. 글자는 text-* 클래스로 색을 바꿀 수 있습니다.
withDefaults(defineProps<{ size?: number, textClass?: string, color?: string }>(), { size: 30, textClass: 'text-[1.375rem] text-primary', color: '#C2410C' })
</script>

<template>
  <span class="inline-flex items-center gap-2 font-serif text-[1.15em] font-normal tracking-tight">
    <svg :width="size" :height="size" viewBox="0 0 96 96" aria-hidden="true" focusable="false">
      <rect width="96" height="96" rx="22" :fill="color" />
      <path d="M48 18c-11.6 0-21 9.1-21 20.4 0 15 21 38.6 21 38.6s21-23.6 21-38.6C69 27.1 59.6 18 48 18z" fill="#fff" />
      <circle cx="48" cy="38.5" r="8" :fill="color" />
    </svg>
    <span :class="textClass">라자</span>
  </span>
</template>
