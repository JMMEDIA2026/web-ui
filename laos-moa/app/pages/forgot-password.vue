<script setup lang="ts">
useSeoMeta({ title: '비밀번호 찾기 · 라자', robots: 'noindex' })

const { data: info } = await useFetch<{ available: boolean }>('/api/members/password-reset-available', { key: 'pw-reset-available', default: () => ({ available: false }) })

// 1단계: 이메일로 코드 받기 → 2단계: 코드와 새 비밀번호 입력 → 완료
const step = ref<'email' | 'code' | 'done'>('email')
const email = ref('')
const code = ref('')
const newPassword = ref('')
const showPw = ref(false)
const loading = ref(false)
const error = ref('')
const notice = ref('')

async function sendCode() {
  error.value = ''
  notice.value = ''
  if (!email.value.trim()) { error.value = '이메일을 입력해 주세요.'; document.getElementById('f-email')?.focus(); return }
  loading.value = true
  try {
    const res = await $fetch<{ message: string }>('/api/members/forgot', { method: 'POST', body: { email: email.value } })
    notice.value = res.message
    step.value = 'code'
    await nextTick()
    document.getElementById('f-code')?.focus()
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}

async function resetPw() {
  error.value = ''
  if (code.value.trim().length < 8) { error.value = '메일로 받은 8자리 코드를 입력해 주세요.'; document.getElementById('f-code')?.focus(); return }
  if (!newPassword.value) { error.value = '새 비밀번호를 입력해 주세요.'; document.getElementById('f-pw')?.focus(); return }
  loading.value = true
  try {
    await $fetch('/api/members/reset', { method: 'POST', body: { email: email.value, code: code.value, newPassword: newPassword.value } })
    step.value = 'done'
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="px-4 pt-6 sm:px-5">
    <h1 data-page-title tabindex="-1" class="text-[1.625rem] font-extrabold text-highlighted">
      비밀번호 찾기
    </h1>

    <p v-if="!info?.available" class="mt-3 rounded-lg bg-muted p-4 text-[0.9375rem] leading-relaxed text-highlighted">
      지금은 이메일 발송을 준비하고 있어요. 비밀번호를 바꾸려면 라자 운영진에게 문의해 주세요.
    </p>

    <template v-else-if="step === 'email'">
      <p class="mt-1 text-[0.9375rem] leading-relaxed text-muted">
        가입한 이메일을 입력하면 비밀번호를 바꿀 수 있는 코드를 보내 드려요.
      </p>
      <form class="mt-4 space-y-4" novalidate @submit.prevent="sendCode">
        <div>
          <label for="f-email" class="text-[0.9375rem] font-bold text-highlighted">이메일</label>
          <UInput id="f-email" v-model="email" type="email" autocomplete="email" inputmode="email" required size="xl" class="mt-1.5 w-full" />
        </div>
        <p v-if="error" class="rounded-lg bg-red-50 p-3 text-[0.9375rem] font-bold text-red-700" role="alert">{{ error }}</p>
        <UButton color="primary" variant="solid" size="xl" block type="submit" :disabled="loading">
          {{ loading ? '보내는 중…' : '코드 보내기' }}
        </UButton>
      </form>
    </template>

    <template v-else-if="step === 'code'">
      <p class="mt-1 rounded-lg bg-primary/5 p-3 text-[0.9375rem] leading-relaxed text-highlighted" role="status">
        {{ notice }} 코드는 30분 동안 쓸 수 있어요. 메일이 안 보이면 스팸함도 확인해 주세요.
      </p>
      <form class="mt-4 space-y-4" novalidate @submit.prevent="resetPw">
        <div>
          <label for="f-code" class="text-[0.9375rem] font-bold text-highlighted">메일로 받은 코드 (8자리)</label>
          <UInput id="f-code" v-model="code" autocomplete="one-time-code" maxlength="8" required size="xl" class="mt-1.5 w-full uppercase tracking-widest" />
        </div>
        <div>
          <label for="f-pw" class="text-[0.9375rem] font-bold text-highlighted">새 비밀번호</label>
          <UInput id="f-pw" v-model="newPassword" :type="showPw ? 'text' : 'password'" autocomplete="new-password" required size="xl" class="mt-1.5 w-full" aria-describedby="f-pw-hint" />
          <p id="f-pw-hint" class="mt-1 text-[0.8125rem] text-muted">영문과 숫자를 함께 넣어 8자 이상으로 만들어 주세요.</p>
          <label class="mt-1 flex min-h-11 items-center gap-2 text-[0.9375rem] text-highlighted">
            <input v-model="showPw" type="checkbox" class="size-5 accent-[var(--ui-primary)]">
            비밀번호 보이기
          </label>
        </div>
        <p v-if="error" class="rounded-lg bg-red-50 p-3 text-[0.9375rem] font-bold text-red-700" role="alert">{{ error }}</p>
        <UButton color="primary" variant="solid" size="xl" block type="submit" :disabled="loading">
          {{ loading ? '바꾸는 중…' : '비밀번호 바꾸기' }}
        </UButton>
        <UButton color="neutral" variant="outline" size="lg" block type="button" :disabled="loading" @click="step = 'email'; error = ''">
          코드 다시 받기
        </UButton>
      </form>
    </template>

    <section v-else class="card mt-4 p-5 text-center" role="status">
      <p class="text-[1.125rem] font-extrabold text-highlighted">비밀번호를 바꿨어요</p>
      <p class="mt-1 text-[0.9375rem] text-muted">새 비밀번호로 로그인해 주세요.</p>
      <UButton to="/login" color="primary" size="xl" block class="mt-4">로그인하러 가기</UButton>
    </section>

    <p class="mt-6 text-center">
      <NuxtLink to="/login" class="inline-flex min-h-11 items-center text-[0.9375rem] font-bold text-muted underline underline-offset-2">로그인으로 돌아가기</NuxtLink>
    </p>
  </div>
</template>
