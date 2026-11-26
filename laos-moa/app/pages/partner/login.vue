<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: '협력업체 로그인 · 라자' })

const form = reactive({ id: '', code: '' })
const loading = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/partner/login', { method: 'POST', body: { id: form.id, code: form.code } })
    await navigateTo('/partner')
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UContainer class="flex min-h-[70vh] items-center justify-center py-12">
    <form class="box3d w-full max-w-sm border border-default bg-default p-7" @submit.prevent="submit">
      <h1 class="text-xl font-extrabold text-highlighted">
        협력업체 로그인
      </h1>
      <p class="mt-1 text-sm text-muted">
        라자에서 받은 로그인 ID와 접속 코드를 입력하세요.
      </p>

      <label for="partner-id" class="mt-6 block text-sm font-bold text-highlighted">로그인 ID</label>
      <UInput id="partner-id" v-model="form.id" autocomplete="username" autocapitalize="none" size="lg" class="mt-2 w-full" autofocus />

      <label for="partner-code" class="mt-4 block text-sm font-bold text-highlighted">접속 코드</label>
      <UInput id="partner-code" v-model="form.code" autocomplete="current-password" autocapitalize="characters" size="lg" class="mt-2 w-full font-mono" />

      <UAlert v-if="error" class="mt-4" color="error" variant="subtle" icon="i-lucide-circle-alert" :title="error" />

      <UButton type="submit" label="로그인" size="lg" block class="mt-5" :loading="loading" :disabled="!form.id || !form.code" />
      <p class="mt-5 text-center text-sm text-muted">
        아직 협력업체가 아니신가요?
        <NuxtLink to="/partner/apply" class="font-bold text-primary underline">가입 신청</NuxtLink>
      </p>
    </form>
  </UContainer>
</template>
