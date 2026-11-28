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
  <main class="mx-auto flex min-h-dvh max-w-[560px] flex-col items-center justify-center bg-default px-6 text-center">
    <AppLogo :size="40" text-class="text-[1.625rem] text-primary" />
    <h1 class="mt-6 text-[1.5rem] font-bold text-highlighted">
      {{ notFound ? '찾으시는 페이지가 없어요' : '문제가 생겼어요' }}
    </h1>
    <p class="mt-2 text-[1rem] leading-relaxed text-muted">
      {{ notFound ? '주소가 바뀌었거나 없어진 업체·가이드일 수 있어요.' : '잠시 후 다시 시도해 주세요.' }}
    </p>
    <div class="mt-6 flex w-full max-w-xs flex-col gap-2">
      <UButton color="primary" variant="solid" size="xl" v-if="!notFound" type="button"  @click="retry">
        다시 시도
      </UButton>
      <UButton type="button" :color="notFound ? 'primary' : 'neutral'" :variant="notFound ? 'solid' : 'outline'" size="xl" @click="go('/businesses')">
        업체 탐색으로
      </UButton>
      <UButton color="neutral" variant="outline" size="xl" type="button"  @click="go('/')">
        홈으로
      </UButton>
    </div>
  </main>
</template>
