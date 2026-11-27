<script setup lang="ts">
import { formatDateTime } from '~/data/status'

// 내 정보: 로그인한 회원만 볼 수 있습니다. 비회원은 로그인 화면으로 이동합니다.
definePageMeta({ middleware: 'member' })

useSeoMeta({
  robots: 'noindex',
  title: '내 정보 · 라자',
  description: '내 회원 정보, 예약 요청, 광고·제휴 문의.'
})

const { member, refresh } = useMember()

// ---- 내 예약 ----
interface MyReservation {
  id: string
  businessId: string
  businessName: string
  service: string
  date: string
  people: number
  note: string
  status: 'pending' | 'confirmed' | 'declined' | 'completed' | 'cancelled'
  createdAt: string
}
const { data: myRes, pending: resPending } = await useFetch<{ reservations: MyReservation[] }>('/api/members/reservations', {
  key: 'my-reservations',
  headers: useRequestHeaders(['cookie']),
  default: () => ({ reservations: [] })
})
const reservations = computed(() => myRes.value?.reservations ?? [])

// 상태 표시: 색에만 의존하지 않도록 글자와 기호를 함께 보여 줍니다.
const RES_STATUS = {
  pending: { label: '확인 대기', mark: '⏳', cls: 'bg-gold-50 text-gold-700', hint: '업체가 확인하고 있어요. 확정되면 연락드려요.' },
  confirmed: { label: '예약 확정', mark: '✅', cls: 'bg-green-100 text-green-800', hint: '예약이 확정됐어요. 날짜에 맞춰 방문해 주세요.' },
  declined: { label: '예약 불가', mark: '⚠️', cls: 'bg-red-100 text-red-800', hint: '이번에는 어려워요. 다른 날짜나 업체로 다시 요청해 보세요.' },
  completed: { label: '이용 완료', mark: '🙌', cls: 'bg-muted text-highlighted', hint: '이용해 주셔서 고마워요.' },
  cancelled: { label: '취소됨', mark: '✖️', cls: 'bg-muted text-muted', hint: '취소된 예약이에요.' }
} as const
const resMeta = (s: string) => RES_STATUS[s as keyof typeof RES_STATUS] ?? { label: s, mark: '•', cls: 'bg-muted text-highlighted', hint: '' }
const WEEK = ['일', '월', '화', '수', '목', '금', '토']
function dateLabel(ymd: string) {
  const [y, m, d] = ymd.split('-').map(Number)
  if (!y || !m || !d) return ymd
  return `${m}월 ${d}일 (${WEEK[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]})`
}
const requestedAt = (iso: string) => formatDateTime(iso)

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
    <h1 data-page-title tabindex="-1" class="text-[1.625rem] font-bold text-highlighted">
      내 정보
    </h1>
    <p class="mt-1 text-[0.9375rem] leading-relaxed text-muted">
      내 정보를 확인하고 예약과 문의를 보낼 수 있어요.
    </p>

    <!-- 회원 상태 -->
    <section v-if="member" class="card mt-4 p-4" aria-labelledby="member-title">
      <h2 id="member-title" class="flex flex-wrap items-center gap-2 text-[1.125rem] font-bold text-highlighted">
        {{ member.nickname }}님
        <span v-if="member.grade" class="rounded-md bg-primary/10 px-2 py-0.5 font-sans text-[0.8125rem] font-bold text-primary">
          {{ member.grade.level }}등급 · {{ member.grade.name }}
        </span>
      </h2>
      <p v-if="member.grade?.next" class="mt-1 text-[0.8125rem] text-muted">
        다음 등급 {{ member.grade.next.level }}등급 {{ member.grade.next.name }}까지 {{ member.grade.next.remaining }}점
        (현재 {{ member.grade.score }}점)
      </p>
      <p v-else-if="member.role === 'admin'" class="mt-1 text-[0.8125rem] text-muted">
        10등급 관리자 계정이에요.
      </p>
      <p v-else-if="member.grade" class="mt-1 text-[0.8125rem] text-muted">
        회원 최고 등급이에요. (현재 {{ member.grade.score }}점)
      </p>
      <dl class="mt-2 space-y-1 text-[0.9375rem]">
        <div class="flex gap-2">
          <dt class="w-16 shrink-0 text-muted">이메일</dt>
          <dd class="min-w-0 break-all text-highlighted">{{ member.email }}</dd>
        </div>
        <div class="flex gap-2">
          <dt class="w-16 shrink-0 text-muted">실명</dt>
          <dd class="min-w-0 break-words text-highlighted">{{ member.realName }}</dd>
        </div>
        <div class="flex gap-2">
          <dt class="w-16 shrink-0 text-muted">휴대폰</dt>
          <dd class="min-w-0 break-all text-highlighted">{{ member.phone }}</dd>
        </div>
      </dl>
      <details class="mt-3 border-t border-default pt-1" @toggle="loadGrades">
        <summary class="flex min-h-11 cursor-pointer items-center text-[0.9375rem] font-bold text-primary">
          등급 안내
        </summary>
        <div v-if="gradeInfo" class="pb-2 text-[0.875rem] text-highlighted">
          <p class="leading-relaxed text-muted">
            점수는 가입 후 7일마다 {{ gradeInfo.rules.perWeek }}점, 예약 요청 1건당 {{ gradeInfo.rules.perReservation }}점, 문의 1건당 {{ gradeInfo.rules.perInquiry }}점이에요. 취소·거절된 예약은 빠져요. 등급은 자동으로 올라가요.
          </p>
          <ul class="mt-2 divide-y divide-default rounded-lg border border-default">
            <li v-for="g in gradeInfo.grades" :key="g.level" class="flex items-center justify-between px-3 py-2" :class="member.grade?.level === g.level ? 'bg-primary/10 font-bold' : ''">
              <span>{{ g.level }}등급 · {{ g.name }}</span>
              <span class="text-muted">{{ g.min === null ? '운영진' : `${g.min}점~` }}</span>
            </li>
          </ul>
        </div>
        <p v-else class="pb-2 text-[0.875rem] text-muted">
          불러오는 중…
        </p>
      </details>
      <div class="mt-1 flex flex-wrap gap-2">
        <UButton color="neutral" variant="outline" size="md" type="button"  :disabled="busy" @click="logout">
          로그아웃
        </UButton>
        <UButton color="primary" variant="soft" size="md" type="button"  :aria-expanded="leaving" @click="leaving = !leaving">
          회원 탈퇴
        </UButton>
      </div>
      <form v-if="leaving" class="mt-3 space-y-2 border-t border-default pt-3" @submit.prevent="leave">
        <p class="text-[0.875rem] leading-relaxed text-muted">
          탈퇴하면 회원 정보가 삭제되고 되돌릴 수 없어요. 예약·문의 기록은 1년간 보관된 뒤 삭제돼요. 쓴 글과 댓글은 "탈퇴한 회원"이 쓴 것으로 바뀌어 남아요. 비밀번호를 입력해 주세요.
        </p>
        <label for="leave-pw" class="sr-only">비밀번호</label>
        <UInput id="leave-pw" v-model="leavePw" type="password" autocomplete="current-password" required size="xl" class="w-full" />
        <p v-if="leaveError" class="text-[0.875rem] font-bold text-red-700" role="alert">
          {{ leaveError }}
        </p>
        <UButton color="primary" variant="solid" size="xl" block type="submit"  :disabled="busy || !leavePw">
          탈퇴하기
        </UButton>
      </form>
    </section>

    <!-- 내가 요청한 예약 -->
    <section id="my-reservations" class="card mt-4 p-4" aria-labelledby="myres-title">
      <div class="flex items-center justify-between gap-2">
        <h2 id="myres-title" class="text-[1.125rem] font-bold text-highlighted">
          내 예약
          <span v-if="reservations.length" class="ms-1 font-sans text-[0.875rem] font-bold text-muted">{{ reservations.length }}건</span>
        </h2>
        <NuxtLink to="/reserve" class="inline-flex min-h-11 items-center text-[0.875rem] font-bold text-primary underline underline-offset-2">예약 요청하기</NuxtLink>
      </div>

      <p v-if="resPending" class="mt-2 text-[0.9375rem] text-muted">불러오는 중이에요…</p>
      <ul v-else-if="reservations.length" class="mt-2 divide-y divide-default">
        <li v-for="r in reservations" :key="r.id" class="py-3">
          <div class="flex items-start justify-between gap-2">
            <p class="min-w-0 break-words text-[1rem] font-bold text-highlighted">
              {{ r.businessName || '업체 정보 없음' }}
            </p>
            <span class="inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[0.8125rem] font-bold" :class="resMeta(r.status).cls">
              <span aria-hidden="true">{{ resMeta(r.status).mark }}</span>{{ resMeta(r.status).label }}
            </span>
          </div>
          <p class="mt-1 text-[0.9375rem] text-highlighted">
            {{ dateLabel(r.date) }} · {{ r.people }}명<template v-if="r.service"> · {{ r.service }}</template>
          </p>
          <p class="mt-0.5 text-[0.8125rem] leading-relaxed text-muted">
            {{ resMeta(r.status).hint }}
          </p>
          <p class="mt-0.5 text-[0.75rem] text-muted">
            요청 {{ requestedAt(r.createdAt) }} · 예약번호 {{ r.id }}
          </p>
        </li>
      </ul>
      <div v-else class="mt-2 text-[0.9375rem] leading-relaxed text-muted">
        <p>아직 요청한 예약이 없어요.</p>
        <p>업체를 골라 예약을 요청하면 이곳에서 진행 상태를 볼 수 있어요.</p>
      </div>
    </section>

    <ul class="rows card mt-4 overflow-hidden">
      <li v-for="i in items" :key="i.to">
        <NuxtLink :to="i.to" class="flex min-h-[72px] items-center gap-3 px-4 py-3 active:bg-primary/10">
          <span class="grid size-11 shrink-0 place-items-center rounded-lg bg-primary/5 text-primary">
            <AppIcon :name="i.icon" class="size-8" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block text-[1rem] font-bold text-highlighted">{{ i.label }}</span>
            <span class="block text-[0.875rem] text-muted">{{ i.desc }}</span>
          </span>
          <AppIcon name="next" class="size-5 shrink-0 text-muted" />
        </NuxtLink>
      </li>
    </ul>

    <nav class="mt-6 flex gap-4" aria-label="약관">
      <NuxtLink to="/terms" class="inline-flex min-h-11 items-center text-[0.875rem] font-bold text-muted underline">
        이용약관
      </NuxtLink>
      <NuxtLink to="/privacy" class="inline-flex min-h-11 items-center text-[0.875rem] font-bold text-muted underline">
        개인정보 처리 안내
      </NuxtLink>
    </nav>
  </div>
</template>
