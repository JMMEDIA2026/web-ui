<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: '관리자 로그인 · 라오스모아' })

const password = ref('')
const loading = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/admin/login', { method: 'POST', body: { password: password.value } })
    await navigateTo('/admin')
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UContainer class="flex min-h-[70vh] items-center justify-center py-12">
    <form class="box3d w-full max-w-sm border border-default bg-white p-7" @submit.prevent="submit">
      <h1 class="text-xl font-extrabold text-highlighted">
        관리자 로그인
      </h1>
      <p class="mt-1 text-sm text-muted">
        관리자만 들어올 수 있는 페이지입니다.
      </p>

      <label for="admin-password" class="mt-6 block text-sm font-bold text-highlighted">비밀번호</label>
      <UInput
        id="admin-password"
        v-model="password"
        type="password"
        autocomplete="current-password"
        size="lg"
        class="mt-2 w-full"
        autofocus
      />

      <UAlert v-if="error" class="mt-4" color="error" variant="subtle" icon="i-lucide-circle-alert" :title="error" />

      <UButton type="submit" label="로그인" size="lg" block class="mt-5" :loading="loading" :disabled="!password" />
    </form>
  </UContainer>
</template>
