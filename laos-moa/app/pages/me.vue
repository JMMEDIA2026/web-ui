<script setup lang="ts">
// 내 정보: 회원 정보와, 지금 실제로 제공하는 기능만 모았습니다.
useSeoMeta({
  title: '내 정보 · 라자',
  description: '예약 요청, 협력업체 로그인, 광고·제휴 문의.'
})

const { member, refresh } = useMember()
const toast = useToast()

const leaving = ref(false)
const leavePw = ref('')
const leaveError = ref('')
const busy = ref(false)

async function logout() {
  busy.value = true
  try {
    await $fetch('/api/members/logout', { method: 'POST' })
    await refresh()
    await refreshNuxtData('member')
    toast.add({ title: '로그아웃했어요', color: 'neutral' })
  } finally {
    busy.value = false
  }
}

async function leave() {
  leaveError.value = ''
  busy.value = true
  try {
    await $fetch('/api/members/delete', { method: 'POST', body: { password: leavePw.value } })
    await refresh()
    await refreshNuxtData('member')
    leaving.value = false
    leavePw.value = ''
    toast.add({ title: '탈퇴가 완료됐어요', color: 'neutral' })
  } catch (e) {
    leaveError.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}

const items = [
  { label: '예약 요청하기', desc: '협력업체에 예약을 요청해요', icon: 'calendar', to: '/reserve' },
  { label: '협력업체 로그인', desc: '받은 예약을 확인하는 업체용', icon: 'biz', to: '/partner/login' },
  { label: '업체 등록·광고 문의', desc: '무료 등록과 광고 안내', icon: 'megaphone', to: '/advertise' }
]
</script>

<template>
  <div class="px-4 pt-5 sm:px-5">
    <h1 data-page-title tabindex="-1" class="text-[1.625rem] font-bold text-ink">
      내 정보
    </h1>
    <p class="mt-1 text-[0.9375rem] leading-relaxed text-ink-2">
      업체 검색·환율·가이드는 가입 없이 쓸 수 있고, 예약과 문의는 회원만 보낼 수 있어요.
    </p>

    <!-- 회원 상태 -->
    <section v-if="member" class="card mt-4 p-4" aria-labelledby="member-title">
      <h2 id="member-title" class="text-[1.125rem] font-bold text-ink">
        {{ member.nickname }}님
      </h2>
      <dl class="mt-2 space-y-1 text-[0.9375rem]">
        <div class="flex gap-2">
          <dt class="w-16 shrink-0 text-ink-2">이메일</dt>
          <dd class="min-w-0 break-all text-ink">{{ member.email }}</dd>
        </div>
        <div class="flex gap-2">
          <dt class="w-16 shrink-0 text-ink-2">실명</dt>
          <dd class="text-ink">{{ member.realName }}</dd>
        </div>
        <div class="flex gap-2">
          <dt class="w-16 shrink-0 text-ink-2">휴대폰</dt>
          <dd class="text-ink">{{ member.phone }}</dd>
        </div>
      </dl>
      <div class="mt-3 flex flex-wrap gap-2">
        <button type="button" class="btn btn-outline btn-sm" :disabled="busy" @click="logout">
          로그아웃
        </button>
        <button type="button" class="btn btn-quiet btn-sm" :aria-expanded="leaving" @click="leaving = !leaving">
          회원 탈퇴
        </button>
      </div>
      <form v-if="leaving" class="mt-3 space-y-2 border-t border-line pt-3" @submit.prevent="leave">
        <p class="text-[0.875rem] leading-relaxed text-ink-2">
          탈퇴하면 회원 정보가 삭제되고 되돌릴 수 없어요. 비밀번호를 입력해 주세요.
        </p>
        <label for="leave-pw" class="sr-only">비밀번호</label>
        <input id="leave-pw" v-model="leavePw" type="password" autocomplete="current-password" class="field" required>
        <p v-if="leaveError" class="text-[0.875rem] font-bold text-red-700" role="alert">
          {{ leaveError }}
        </p>
        <button type="submit" class="btn btn-primary w-full" :disabled="busy || !leavePw">
          탈퇴하기
        </button>
      </form>
    </section>
    <section v-else class="card mt-4 p-4" aria-labelledby="guest-title">
      <h2 id="guest-title" class="text-[1.125rem] font-bold text-ink">
        로그인이 필요해요
      </h2>
      <p class="mt-1 text-[0.9375rem] text-ink-2">
        예약과 문의를 보내려면 회원가입 후 로그인해 주세요.
      </p>
      <div class="mt-3 grid grid-cols-2 gap-2">
        <NuxtLink to="/login" class="btn btn-outline">
          로그인
        </NuxtLink>
        <NuxtLink to="/signup" class="btn btn-primary">
          회원가입
        </NuxtLink>
      </div>
    </section>

    <ul class="rows card mt-4 overflow-hidden">
      <li v-for="i in items" :key="i.to">
        <NuxtLink :to="i.to" class="flex min-h-[72px] items-center gap-3 px-4 py-3 active:bg-brand-100">
          <span class="grid size-11 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
            <AppIcon :name="i.icon" class="size-8" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block text-[1rem] font-bold text-ink">{{ i.label }}</span>
            <span class="block text-[0.875rem] text-ink-2">{{ i.desc }}</span>
          </span>
          <AppIcon name="next" class="size-5 shrink-0 text-ink-2" />
        </NuxtLink>
      </li>
    </ul>

    <nav class="mt-6 flex gap-4" aria-label="약관">
      <NuxtLink to="/terms" class="inline-flex min-h-11 items-center text-[0.875rem] font-bold text-ink-2 underline">
        이용약관
      </NuxtLink>
      <NuxtLink to="/privacy" class="inline-flex min-h-11 items-center text-[0.875rem] font-bold text-ink-2 underline">
        개인정보 처리 안내
      </NuxtLink>
    </nav>

    <section class="mt-4" aria-labelledby="credit-title">
      <h2 id="credit-title" class="text-[0.9375rem] font-bold text-ink">
        출처 안내
      </h2>
      <ul class="mt-1 text-[0.8125rem] leading-relaxed text-ink-2">
        <li>
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener" class="inline-flex min-h-11 items-center underline">지도 © OpenStreetMap contributors</a>
        </li>
        <li>
          <a href="https://www.exchangerate-api.com" target="_blank" rel="noopener" class="inline-flex min-h-11 items-center underline">환율 제공 ExchangeRate-API (국제 기준 환율, 참고용)</a>
        </li>
        <li>
          <a href="https://github.com/microsoft/fluentui-emoji" target="_blank" rel="noopener" class="inline-flex min-h-11 items-center underline">3D 아이콘 Microsoft Fluent Emoji (MIT)</a>
        </li>
      </ul>
    </section>
  </div>
</template>
