<script setup lang="ts">
useSeoMeta({ title: '로그인 · 라자', robots: 'noindex' })

const route = useRoute()
const { member, refresh } = useMember()

const next = safeNext(route.query.next, '/me')
const reloginAdmin = route.query.relogin === 'admin'
const needLogin = route.query.need === '1' || reloginAdmin
const needText = reloginAdmin ? '관리자 화면은 12시간마다 다시 로그인해야 열려요. 로그인하면 바로 관리자 화면으로 가요.' : next.startsWith('/me') ? '내 정보는 로그인한 뒤에 볼 수 있어요.' : '예약·문의는 로그인한 회원만 이용할 수 있어요.'

// 이미 로그인했다면 바로 이동합니다.
if (member.value && !reloginAdmin) await navigateTo(next, { replace: true })

const form = reactive({ email: '', password: '' })
const showPw = ref(false)
const loading = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  if (!form.email.trim()) { error.value = '이메일을 입력해 주세요.'; document.getElementById('l-email')?.focus(); return }
  if (!form.password) { error.value = '비밀번호를 입력해 주세요.'; document.getElementById('l-pw')?.focus(); return }
  loading.value = true
  try {
    await $fetch('/api/members/login', { method: 'POST', body: { ...form } })
    await refresh()
    await refreshNuxtData('member')
    await navigateTo(next, { replace: true })
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="px-4 pt-5 sm:px-5">
    <h1 data-page-title tabindex="-1" class="text-[1.625rem] font-bold text-ink">
      로그인
    </h1>
    <p v-if="needLogin" class="mt-2 rounded-lg bg-brand-100 p-3 text-[0.9375rem] font-semibold text-brand-700" role="status">
      {{ needText }}
    </p>

    <form class="mt-4 space-y-4" novalidate @submit.prevent="submit">
      <div>
        <label for="l-email" class="text-[0.9375rem] font-bold text-ink">이메일</label>
        <input id="l-email" v-model="form.email" type="email" inputmode="email" autocomplete="email" class="field mt-1.5" required>
      </div>
      <div>
        <label for="l-pw" class="text-[0.9375rem] font-bold text-ink">비밀번호</label>
        <input id="l-pw" v-model="form.password" :type="showPw ? 'text' : 'password'" autocomplete="current-password" class="field mt-1.5" required>
        <label class="mt-1 flex min-h-11 cursor-pointer items-center gap-3 text-[0.9375rem] text-ink">
          <input v-model="showPw" type="checkbox" class="size-6 shrink-0 accent-brand-500">
          비밀번호 보이기
        </label>
      </div>

      <p v-if="error" class="rounded-lg bg-red-50 p-3 text-[0.9375rem] font-bold text-red-700" role="alert">
        {{ error }}
      </p>

      <button type="submit" class="btn btn-primary w-full" :disabled="loading">
        {{ loading ? '로그인 중…' : '로그인' }}
      </button>
    </form>

    <p class="mt-5 text-center text-[0.9375rem] text-ink-2">
      아직 회원이 아니신가요?
    </p>
    <NuxtLink :to="{ path: '/signup', query: route.query.next ? { next: route.query.next } : {} }" class="btn btn-outline mt-2 w-full">
      회원가입
    </NuxtLink>

    <div class="mt-8 border-t border-line pt-2">
      <nav class="flex gap-4" aria-label="약관">
        <NuxtLink to="/terms" class="inline-flex min-h-11 items-center text-[0.8125rem] font-bold text-ink-2 underline">
          이용약관
        </NuxtLink>
        <NuxtLink to="/privacy" class="inline-flex min-h-11 items-center text-[0.8125rem] font-bold text-ink-2 underline">
          개인정보 처리 안내
        </NuxtLink>
      </nav>
    </div>
  </div>
</template>
