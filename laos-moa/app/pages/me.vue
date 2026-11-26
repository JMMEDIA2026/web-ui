<script setup lang="ts">
// 내 정보: 로그인한 회원만 볼 수 있습니다. 비회원은 로그인 화면으로 이동합니다.
definePageMeta({ middleware: 'member' })

useSeoMeta({
  robots: 'noindex',
  title: '내 정보 · 라자',
  description: '내 회원 정보, 예약 요청, 광고·제휴 문의.'
})

const { member, refresh } = useMember()

// 등급표는 안내를 펼칠 때만 불러옵니다.
interface GradeRow { level: number, name: string, min: number | null }
const gradeInfo = ref<{ rules: { perWeek: number, perReservation: number, perInquiry: number }, grades: GradeRow[] } | null>(null)
async function loadGrades(e: Event) {
  if ((e.target as HTMLDetailsElement).open && !gradeInfo.value) {
    gradeInfo.value = await $fetch('/api/members/grades').catch(() => null)
  }
}
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
    await navigateTo('/')
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
    await navigateTo('/')
  } catch (e) {
    leaveError.value = errorMessage(e)
  } finally {
    busy.value = false
  }
}

const items = computed(() => [
  { label: '예약 요청하기', desc: '등록된 업체에 예약을 요청해요', icon: 'calendar', to: '/reserve' },
  { label: '업체 등록·광고 문의', desc: '무료 등록과 광고 안내', icon: 'megaphone', to: '/advertise' },
  ...(member.value?.role === 'admin' ? [{ label: '관리자 화면', desc: '예약·회원·업체를 관리해요', icon: 'me', to: '/admin' }] : [])
])
</script>

<template>
  <div class="px-4 pt-5 sm:px-5">
    <h1 data-page-title tabindex="-1" class="text-[1.625rem] font-bold text-ink">
      내 정보
    </h1>
    <p class="mt-1 text-[0.9375rem] leading-relaxed text-ink-2">
      내 정보를 확인하고 예약과 문의를 보낼 수 있어요.
    </p>

    <!-- 회원 상태 -->
    <section v-if="member" class="card mt-4 p-4" aria-labelledby="member-title">
      <h2 id="member-title" class="flex flex-wrap items-center gap-2 text-[1.125rem] font-bold text-ink">
        {{ member.nickname }}님
        <span v-if="member.grade" class="rounded-md bg-brand-100 px-2 py-0.5 font-sans text-[0.8125rem] font-bold text-brand-600">
          {{ member.grade.level }}등급 · {{ member.grade.name }}
        </span>
      </h2>
      <p v-if="member.grade?.next" class="mt-1 text-[0.8125rem] text-ink-2">
        다음 등급 {{ member.grade.next.level }}등급 {{ member.grade.next.name }}까지 {{ member.grade.next.remaining }}점
        (현재 {{ member.grade.score }}점)
      </p>
      <p v-else-if="member.role === 'admin'" class="mt-1 text-[0.8125rem] text-ink-2">
        10등급 관리자 계정이에요.
      </p>
      <p v-else-if="member.grade" class="mt-1 text-[0.8125rem] text-ink-2">
        회원 최고 등급이에요. (현재 {{ member.grade.score }}점)
      </p>
      <dl class="mt-2 space-y-1 text-[0.9375rem]">
        <div class="flex gap-2">
          <dt class="w-16 shrink-0 text-ink-2">이메일</dt>
          <dd class="min-w-0 break-all text-ink">{{ member.email }}</dd>
        </div>
        <div class="flex gap-2">
          <dt class="w-16 shrink-0 text-ink-2">실명</dt>
          <dd class="min-w-0 break-words text-ink">{{ member.realName }}</dd>
        </div>
        <div class="flex gap-2">
          <dt class="w-16 shrink-0 text-ink-2">휴대폰</dt>
          <dd class="min-w-0 break-all text-ink">{{ member.phone }}</dd>
        </div>
      </dl>
      <details class="mt-3 border-t border-line pt-1" @toggle="loadGrades">
        <summary class="flex min-h-11 cursor-pointer items-center text-[0.9375rem] font-bold text-brand-600">
          등급 안내
        </summary>
        <div v-if="gradeInfo" class="pb-2 text-[0.875rem] text-ink">
          <p class="leading-relaxed text-ink-2">
            점수는 가입 후 7일마다 {{ gradeInfo.rules.perWeek }}점, 예약 요청 1건당 {{ gradeInfo.rules.perReservation }}점, 문의 1건당 {{ gradeInfo.rules.perInquiry }}점이에요. 취소·거절된 예약은 빠져요. 등급은 자동으로 올라가요.
          </p>
          <ul class="mt-2 divide-y divide-line rounded-lg border border-line">
            <li v-for="g in gradeInfo.grades" :key="g.level" class="flex items-center justify-between px-3 py-2" :class="member.grade?.level === g.level ? 'bg-brand-100 font-bold' : ''">
              <span>{{ g.level }}등급 · {{ g.name }}</span>
              <span class="text-ink-2">{{ g.min === null ? '운영진' : `${g.min}점~` }}</span>
            </li>
          </ul>
        </div>
        <p v-else class="pb-2 text-[0.875rem] text-ink-2">
          불러오는 중…
        </p>
      </details>
      <div class="mt-1 flex flex-wrap gap-2">
        <button type="button" class="btn btn-outline btn-sm" :disabled="busy" @click="logout">
          로그아웃
        </button>
        <button type="button" class="btn btn-quiet btn-sm" :aria-expanded="leaving" @click="leaving = !leaving">
          회원 탈퇴
        </button>
      </div>
      <form v-if="leaving" class="mt-3 space-y-2 border-t border-line pt-3" @submit.prevent="leave">
        <p class="text-[0.875rem] leading-relaxed text-ink-2">
          탈퇴하면 회원 정보가 삭제되고 되돌릴 수 없어요. 예약·문의 기록은 1년간 보관된 뒤 삭제돼요. 쓴 글과 댓글은 "탈퇴한 회원"이 쓴 것으로 바뀌어 남아요. 비밀번호를 입력해 주세요.
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
          <a href="https://simpleicons.org" target="_blank" rel="noopener" class="inline-flex min-h-11 items-center underline">SNS 로고 Simple Icons (CC0)</a>
        </li>
        <li>
          <a href="https://github.com/microsoft/fluentui-emoji" target="_blank" rel="noopener" class="inline-flex min-h-11 items-center underline">3D 아이콘 Microsoft Fluent Emoji (MIT)</a>
        </li>
      </ul>
    </section>
  </div>
</template>
