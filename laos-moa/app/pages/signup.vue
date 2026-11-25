<script setup lang="ts">
useSeoMeta({ title: '회원가입 · 라자', robots: 'noindex' })

const route = useRoute()
const { member, refresh } = useMember()
const next = safeNext(route.query.next, '/me')

if (member.value) await navigateTo(next, { replace: true })

const form = reactive({
  email: '',
  password: '',
  password2: '',
  nickname: '',
  realName: '',
  phone: '',
  gender: '' as '' | 'M' | 'F' | 'N',
  agreeTerms: false,
  agreePrivacy: false,
  website: ''
})
const showPw = ref(false)
const loading = ref(false)
const error = ref('')

const genders = [
  { value: 'M', label: '남성' },
  { value: 'F', label: '여성' },
  { value: 'N', label: '선택 안 함' }
] as const

const agreeAll = computed({
  get: () => form.agreeTerms && form.agreePrivacy,
  set: (v: boolean) => { form.agreeTerms = v; form.agreePrivacy = v }
})

const pwMismatch = computed(() => form.password2.length > 0 && form.password !== form.password2)
const canSubmit = computed(() =>
  form.email && form.password.length >= 8 && form.password === form.password2 && form.nickname
  && form.realName && form.phone && form.gender && form.agreeTerms && form.agreePrivacy
)

async function submit() {
  error.value = ''
  if (form.password !== form.password2) {
    error.value = '비밀번호가 서로 달라요'
    return
  }
  loading.value = true
  try {
    const { password2: _unused, ...body } = form
    await $fetch('/api/members/signup', { method: 'POST', body })
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
      회원가입
    </h1>
    <p class="mt-1 text-[0.9375rem] leading-relaxed text-ink-2">
      예약과 문의를 보낼 때 필요한 정보예요. 업체 검색, 환율, 가이드는 가입 없이도 볼 수 있어요.
    </p>

    <form class="mt-4 space-y-4" @submit.prevent="submit">
      <div>
        <label for="s-email" class="text-[0.9375rem] font-bold text-ink">이메일 <span class="text-brand-600">*</span></label>
        <input id="s-email" v-model="form.email" type="email" inputmode="email" autocomplete="email" class="field mt-1.5" required>
      </div>

      <div>
        <label for="s-pw" class="text-[0.9375rem] font-bold text-ink">비밀번호 <span class="text-brand-600">*</span></label>
        <input id="s-pw" v-model="form.password" :type="showPw ? 'text' : 'password'" autocomplete="new-password" minlength="8" maxlength="64" class="field mt-1.5" aria-describedby="s-pw-help" required>
        <p id="s-pw-help" class="mt-1 text-[0.8125rem] text-ink-2">
          8자 이상, 영문과 숫자를 함께 넣어 주세요.
        </p>
      </div>
      <div>
        <label for="s-pw2" class="text-[0.9375rem] font-bold text-ink">비밀번호 확인 <span class="text-brand-600">*</span></label>
        <input id="s-pw2" v-model="form.password2" :type="showPw ? 'text' : 'password'" autocomplete="new-password" class="field mt-1.5" :aria-invalid="pwMismatch" required>
        <p v-if="pwMismatch" class="mt-1 text-[0.8125rem] font-bold text-red-700" role="alert">
          비밀번호가 서로 달라요.
        </p>
        <label class="mt-1 flex min-h-11 cursor-pointer items-center gap-3 text-[0.9375rem] text-ink">
          <input v-model="showPw" type="checkbox" class="size-6 shrink-0 accent-[#635BFF]">
          비밀번호 보이기
        </label>
      </div>

      <div>
        <label for="s-nick" class="text-[0.9375rem] font-bold text-ink">닉네임 <span class="text-brand-600">*</span></label>
        <input id="s-nick" v-model="form.nickname" autocomplete="nickname" minlength="2" maxlength="12" class="field mt-1.5" aria-describedby="s-nick-help" required>
        <p id="s-nick-help" class="mt-1 text-[0.8125rem] text-ink-2">
          2~12자, 한글·영문·숫자·_ 만 쓸 수 있어요.
        </p>
      </div>

      <div>
        <label for="s-name" class="text-[0.9375rem] font-bold text-ink">실명 <span class="text-brand-600">*</span></label>
        <input id="s-name" v-model="form.realName" autocomplete="name" maxlength="30" class="field mt-1.5" aria-describedby="s-name-help" required>
        <p id="s-name-help" class="mt-1 text-[0.8125rem] text-ink-2">
          예약할 때 업체에 전달되는 이름이에요.
        </p>
      </div>

      <div>
        <label for="s-phone" class="text-[0.9375rem] font-bold text-ink">휴대폰 번호 <span class="text-brand-600">*</span></label>
        <input id="s-phone" v-model="form.phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="20" class="field mt-1.5" placeholder="010-1234-5678 또는 +856 20…" required>
      </div>

      <fieldset>
        <legend class="text-[0.9375rem] font-bold text-ink">
          성별 <span class="text-brand-600">*</span>
        </legend>
        <div class="mt-1.5 grid grid-cols-3 gap-2">
          <label v-for="g in genders" :key="g.value" class="block">
            <input v-model="form.gender" type="radio" name="gender" :value="g.value" class="peer sr-only" required>
            <span class="flex min-h-[52px] cursor-pointer items-center justify-center rounded-lg border border-line bg-white px-1 text-center text-[0.9375rem] font-semibold text-ink peer-checked:border-brand-500 peer-checked:bg-brand-500 peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-500">
              {{ g.label }}
            </span>
          </label>
        </div>
      </fieldset>

      <!-- 약관 동의 -->
      <div class="card p-3">
        <label class="flex min-h-11 cursor-pointer items-center gap-3 font-bold text-ink">
          <input v-model="agreeAll" type="checkbox" class="size-6 shrink-0 accent-[#635BFF]">
          전체 동의
        </label>
        <div class="mt-1 border-t border-line pt-1">
          <div class="flex items-center">
            <label class="flex min-h-11 flex-1 cursor-pointer items-center gap-3 text-[0.9375rem] text-ink">
              <input v-model="form.agreeTerms" type="checkbox" class="size-6 shrink-0 accent-[#635BFF]" required>
              (필수) 이용약관 동의
            </label>
            <NuxtLink to="/terms" target="_blank" class="inline-flex min-h-11 items-center px-2 text-[0.875rem] font-bold text-brand-600 underline">
              보기
            </NuxtLink>
          </div>
          <div class="flex items-center">
            <label class="flex min-h-11 flex-1 cursor-pointer items-center gap-3 text-[0.9375rem] text-ink">
              <input v-model="form.agreePrivacy" type="checkbox" class="size-6 shrink-0 accent-[#635BFF]" required>
              (필수) 개인정보 수집·이용 동의
            </label>
            <NuxtLink to="/privacy" target="_blank" class="inline-flex min-h-11 items-center px-2 text-[0.875rem] font-bold text-brand-600 underline">
              보기
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- 스팸 방지용 숨김 필드: 사람은 채우지 않습니다. -->
      <div class="hidden" aria-hidden="true">
        <input v-model="form.website" type="text" name="website" tabindex="-1" autocomplete="off">
      </div>

      <p v-if="error" class="rounded-lg bg-red-50 p-3 text-[0.9375rem] font-bold text-red-700" role="alert">
        {{ error }}
      </p>

      <button type="submit" class="btn btn-primary w-full" :disabled="loading || !canSubmit">
        {{ loading ? '가입하는 중…' : '가입하기' }}
      </button>
    </form>

    <p class="mt-5 text-center text-[0.9375rem] text-ink-2">
      이미 회원이세요?
    </p>
    <NuxtLink :to="{ path: '/login', query: route.query.next ? { next: route.query.next } : {} }" class="btn btn-outline mt-2 w-full">
      로그인
    </NuxtLink>
  </div>
</template>
