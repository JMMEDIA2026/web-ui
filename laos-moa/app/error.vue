<script setup lang="ts">
const props = defineProps<{
  error: { statusCode: number, statusMessage?: string }
}>()

const notFound = computed(() => props.error.statusCode === 404)

useHead({ title: '라자' })

// 이전 주소로 들어온 사람도 길을 잃지 않도록 업체 탐색이나 홈으로 안내합니다.
const go = (to: string) => clearError({ redirect: to })
const retry = () => window.location.reload()
</script>

<template>
  <main class="mx-auto flex min-h-dvh max-w-[560px] flex-col items-center justify-center bg-app-bg px-6 text-center">
    <AppLogo :size="40" text-class="text-[1.625rem] text-brand-600" />
    <h1 class="mt-6 text-[1.5rem] font-bold text-ink">
      {{ notFound ? '찾으시는 페이지가 없어요' : '문제가 생겼어요' }}
    </h1>
    <p class="mt-2 text-[1rem] leading-relaxed text-ink-2">
      {{ notFound ? '주소가 바뀌었거나 없어진 업체·가이드일 수 있어요.' : '잠시 후 다시 시도해 주세요.' }}
    </p>
    <div class="mt-6 flex w-full max-w-xs flex-col gap-2">
      <button v-if="!notFound" type="button" class="btn btn-primary" @click="retry">
        다시 시도
      </button>
      <button type="button" class="btn" :class="notFound ? 'btn-primary' : 'btn-outline'" @click="go('/businesses')">
        업체 탐색으로
      </button>
      <button type="button" class="btn btn-outline" @click="go('/')">
        홈으로
      </button>
    </div>
  </main>
</template>
