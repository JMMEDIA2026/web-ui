<script setup lang="ts">
const props = defineProps<{
  error: { statusCode: number, statusMessage?: string }
}>()

const notFound = computed(() => props.error.statusCode === 404)

useHead({ title: '라오스모아' })

// 이전 주소로 들어온 사람도 길을 잃지 않도록 업체 탐색이나 홈으로 안내합니다.
const go = (to: string) => clearError({ redirect: to })
</script>

<template>
  <div class="mx-auto flex min-h-dvh max-w-[560px] flex-col items-center justify-center bg-[#F5F6F8] px-6 text-center">
    <p class="text-[1.375rem] font-extrabold tracking-tight text-[#5146D8]">
      라오스모아
    </p>
    <h1 class="mt-6 text-[1.5rem] font-bold text-[#1F2430]">
      {{ notFound ? '찾으시는 페이지가 없어요' : '문제가 생겼어요' }}
    </h1>
    <p class="mt-2 text-[1rem] leading-relaxed text-[#606775]">
      {{ notFound ? '주소가 바뀌었거나 없어진 업체·가이드일 수 있어요.' : '잠시 후 다시 시도해 주세요.' }}
    </p>
    <div class="mt-6 flex w-full max-w-xs flex-col gap-2">
      <button type="button" class="btn btn-primary" @click="go('/businesses')">
        업체 탐색으로
      </button>
      <button type="button" class="btn btn-outline" @click="go('/')">
        홈으로
      </button>
    </div>
  </div>
</template>
