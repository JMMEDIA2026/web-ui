<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useSeoMeta({ title: '설정 · 라오스모아 관리자' })

const api = useApi('admin')
const toast = useToast()

const form = reactive({ current: '', next: '', confirm: '' })
const saving = ref(false)

const mismatch = computed(() => form.confirm !== '' && form.next !== form.confirm)
const canSave = computed(() => form.current && form.next.length >= 10 && form.next === form.confirm)

async function save() {
  saving.value = true
  try {
    await api('/password', { method: 'POST', body: { current: form.current, next: form.next } })
    toast.add({ title: '비밀번호를 바꿨습니다', color: 'success' })
    Object.assign(form, { current: '', next: '', confirm: '' })
  } catch (e) {
    toast.add({ title: errorMessage(e), color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UContainer class="py-8">
    <h1 class="text-2xl font-extrabold text-highlighted">
      설정
    </h1>

    <form class="box3d mt-6 max-w-md border border-default bg-white p-6" @submit.prevent="save">
      <h2 class="font-bold text-highlighted">
        관리자 비밀번호 변경
      </h2>
      <p class="mt-1 text-sm text-muted">
        처음 받은 비밀번호는 꼭 바꿔서 쓰세요. 10자 이상으로 정해 주세요.
      </p>

      <label for="cur" class="mt-5 block text-sm font-bold text-highlighted">현재 비밀번호</label>
      <UInput id="cur" v-model="form.current" type="password" autocomplete="current-password" class="mt-1 w-full" />

      <label for="new" class="mt-4 block text-sm font-bold text-highlighted">새 비밀번호 (10자 이상)</label>
      <UInput id="new" v-model="form.next" type="password" autocomplete="new-password" class="mt-1 w-full" />

      <label for="conf" class="mt-4 block text-sm font-bold text-highlighted">새 비밀번호 확인</label>
      <UInput id="conf" v-model="form.confirm" type="password" autocomplete="new-password" class="mt-1 w-full" />
      <p v-if="mismatch" class="mt-1 text-xs text-error">
        새 비밀번호가 서로 다릅니다.
      </p>

      <UButton type="submit" label="비밀번호 변경" class="mt-5" block :loading="saving" :disabled="!canSave" />
    </form>
  </UContainer>
</template>
