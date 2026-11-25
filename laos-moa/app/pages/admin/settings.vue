<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useSeoMeta({ title: '설정 · 라자 관리자' })

const api = useApi('admin')
const toast = useToast()

const testing = ref(false)
const testResult = ref<'' | 'ok' | 'fail' | 'none'>('')

// Slack 알림이 연결됐는지 시험 메시지를 보냅니다.
async function testNotify() {
  testing.value = true
  testResult.value = ''
  try {
    const res = await api<{ configured: boolean, ok: boolean }>('/notify-test', { method: 'POST' })
    testResult.value = !res.configured ? 'none' : res.ok ? 'ok' : 'fail'
  } catch (e) {
    toast.add({ title: errorMessage(e), color: 'error' })
  } finally {
    testing.value = false
  }
}

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

    <section class="box3d mt-6 max-w-md border border-default bg-white p-6" aria-labelledby="slack-title">
      <h2 id="slack-title" class="font-bold text-highlighted">
        Slack 알림
      </h2>
      <p class="mt-1 text-sm text-muted">
        새 예약, 광고 문의, 협력업체 가입 신청이 들어오면 Slack으로 알려 드려요. 시험 알림을 보내 연결을 확인하세요.
      </p>
      <UButton label="시험 알림 보내기" class="mt-4" color="neutral" variant="outline" :loading="testing" @click="testNotify" />
      <UAlert v-if="testResult === 'ok'" class="mt-3" color="success" variant="subtle" icon="i-lucide-circle-check" title="시험 알림을 보냈어요. Slack 채널을 확인해 주세요." />
      <UAlert v-else-if="testResult === 'none'" class="mt-3" color="warning" variant="subtle" icon="i-lucide-circle-alert" title="아직 Slack 주소가 연결되지 않았어요." description="Cloudflare에서 INQUIRY_WEBHOOK_URL 비밀 값을 추가해 주세요." />
      <UAlert v-else-if="testResult === 'fail'" class="mt-3" color="error" variant="subtle" icon="i-lucide-circle-alert" title="알림을 보내지 못했어요." description="Slack Incoming Webhook 주소가 맞는지 확인해 주세요." />
    </section>
  </UContainer>
</template>
