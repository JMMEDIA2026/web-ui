<script setup lang="ts">
import { formatDateTime } from '~/data/status'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useSeoMeta({ title: '회원 · 라자 관리자' })

interface MemberRow {
  id: string
  nickname: string
  real_name: string
  email: string
  phone: string
  gender: string
  created_at: string
  last_login_at: string
  reservation_count: number
  inquiry_count: number
  grade_level: number
  grade_name: string
  grade_score: number
  role: string
}

const api = useApi('admin')
const toast = useToast()

const rows = ref<MemberRow[]>([])
const total = ref(0)
const last7 = ref(0)
const loading = ref(true)
const q = ref('')
const gradeFilter = ref('all')
const gradeItems = [{ label: '전체 등급', value: 'all' }, ...Array.from({ length: 9 }, (_, i) => ({ label: `${i + 1}등급`, value: String(i + 1) }))]

const genderText: Record<string, string> = { M: '남성', F: '여성', N: '선택 안 함' }

async function load() {
  loading.value = true
  try {
    const res = await api<{ total: number, last7: number, members: MemberRow[] }>('/members', { query: { ...(q.value.trim() ? { q: q.value.trim() } : {}), ...(gradeFilter.value !== 'all' ? { grade: gradeFilter.value } : {}) } })
    rows.value = res.members
    total.value = res.total
    last7.value = res.last7
  } finally {
    loading.value = false
  }
}
onMounted(load)

let timer: ReturnType<typeof setTimeout> | undefined
watch(gradeFilter, load)
watch(q, () => {
  clearTimeout(timer)
  timer = setTimeout(load, 300)
})

const roleTarget = ref<string | null>(null)

// 실수로 누르지 않도록 한 번 더 눌러야 바뀝니다.
async function changeRole(m: MemberRow) {
  if (roleTarget.value !== m.id) {
    roleTarget.value = m.id
    setTimeout(() => { if (roleTarget.value === m.id) roleTarget.value = null }, 4000)
    return
  }
  roleTarget.value = null
  const next = m.role === 'admin' ? 'member' : 'admin'
  try {
    await api(`/members/${m.id}/role`, { method: 'POST', body: { role: next } })
    toast.add({ title: next === 'admin' ? `${m.nickname}님을 10등급 관리자로 지정했습니다` : `${m.nickname}님을 일반 회원으로 되돌렸습니다`, color: 'success' })
    await load()
  } catch (e) {
    toast.add({ title: errorMessage(e), color: 'error' })
  }
}

async function copy(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.add({ title: `${label}을(를) 복사했습니다`, color: 'success' })
  } catch {
    toast.add({ title: '복사하지 못했습니다', color: 'warning' })
  }
}
</script>

<template>
  <UContainer class="py-8">
    <h1 class="text-2xl font-extrabold text-highlighted">
      회원
    </h1>
    <p class="mt-1 text-sm text-muted">
      사이트에 가입한 회원입니다. 실명·휴대폰 번호는 개인정보이니 예약 처리 외의 용도로 쓰거나 외부에 공유하지 마세요.
    </p>

    <div class="mt-5 grid grid-cols-2 gap-3 sm:max-w-md">
      <div class="border border-default bg-white p-4">
        <p class="text-xs text-muted">
          전체 회원
        </p>
        <p class="text-2xl font-extrabold text-highlighted">
          {{ total.toLocaleString('ko-KR') }}<span class="ml-1 text-sm font-bold text-muted">명</span>
        </p>
      </div>
      <div class="border border-default bg-white p-4">
        <p class="text-xs text-muted">
          최근 7일 가입
        </p>
        <p class="text-2xl font-extrabold text-highlighted">
          {{ last7.toLocaleString('ko-KR') }}<span class="ml-1 text-sm font-bold text-muted">명</span>
        </p>
      </div>
    </div>

    <div class="mt-5 flex max-w-xl flex-wrap gap-3">
      <div class="min-w-0 flex-1 sm:min-w-[240px]">
        <label for="member-search" class="sr-only">회원 검색</label>
        <UInput id="member-search" v-model="q" icon="i-lucide-search" placeholder="닉네임, 이름, 이메일, 휴대폰 번호로 검색" class="w-full" />
      </div>
      <div class="w-full sm:w-auto">
        <label for="member-grade" class="sr-only">등급 필터</label>
        <USelect id="member-grade" v-model="gradeFilter" :items="gradeItems" class="w-full sm:w-36" />
      </div>
    </div>
    <p class="mt-2 text-xs text-muted">
      등급은 활동 점수로 자동 계산돼요. (가입 후 7일마다 1점, 예약 요청 10점, 문의 5점) 10등급은 관리자 전용이며, 오른쪽 "관리자 지정"으로 회원에게 부여해요.
    </p>

    <p class="mt-3 text-sm text-muted" aria-live="polite">
      <template v-if="q.trim() || gradeFilter !== 'all'">
        검색 결과 {{ rows.length }}명
      </template>
      <template v-else-if="rows.length < total">
        최근 가입한 {{ rows.length }}명을 보여 줍니다. 더 찾으려면 검색을 이용하세요.
      </template>
    </p>

    <div v-if="rows.length" class="mt-3 overflow-x-auto border border-default bg-white">
      <table class="w-full min-w-[1080px] text-left text-sm">
        <thead class="bg-slate-50 text-xs text-muted">
          <tr>
            <th scope="col" class="px-3 py-2 font-bold">등급</th>
            <th scope="col" class="px-3 py-2 font-bold">닉네임</th>
            <th scope="col" class="px-3 py-2 font-bold">실명</th>
            <th scope="col" class="px-3 py-2 font-bold">이메일</th>
            <th scope="col" class="px-3 py-2 font-bold">휴대폰</th>
            <th scope="col" class="px-3 py-2 font-bold">성별</th>
            <th scope="col" class="px-3 py-2 font-bold">가입일</th>
            <th scope="col" class="px-3 py-2 font-bold">최근 로그인</th>
            <th scope="col" class="px-3 py-2 text-right font-bold">예약</th>
            <th scope="col" class="px-3 py-2 text-right font-bold">문의</th>
            <th scope="col" class="px-3 py-2 font-bold">권한</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-default">
          <tr v-for="m in rows" :key="m.id">
            <td class="whitespace-nowrap px-3 py-2">
              <UBadge :label="`${m.grade_level}등급 ${m.grade_name}`" color="primary" variant="subtle" :title="`${m.grade_score}점`" />
            </td>
            <td class="px-3 py-2 font-bold text-highlighted">{{ m.nickname }}</td>
            <td class="px-3 py-2">{{ m.real_name }}</td>
            <td class="px-3 py-2">
              <span class="inline-flex items-center gap-1">
                <span class="break-all">{{ m.email }}</span>
                <UButton icon="i-lucide-copy" variant="ghost" color="neutral" size="xs" :aria-label="`${m.nickname} 이메일 복사`" @click="copy(m.email, '이메일')" />
              </span>
            </td>
            <td class="px-3 py-2">
              <span class="inline-flex items-center gap-1">
                <span>{{ m.phone }}</span>
                <UButton icon="i-lucide-copy" variant="ghost" color="neutral" size="xs" :aria-label="`${m.nickname} 휴대폰 복사`" @click="copy(m.phone, '휴대폰 번호')" />
              </span>
            </td>
            <td class="px-3 py-2">{{ genderText[m.gender] ?? m.gender }}</td>
            <td class="whitespace-nowrap px-3 py-2 text-muted">{{ formatDateTime(m.created_at) }}</td>
            <td class="whitespace-nowrap px-3 py-2 text-muted">{{ m.last_login_at ? formatDateTime(m.last_login_at) : '-' }}</td>
            <td class="px-3 py-2 text-right tabular-nums">{{ m.reservation_count }}</td>
            <td class="px-3 py-2 text-right tabular-nums">{{ m.inquiry_count }}</td>
            <td class="whitespace-nowrap px-3 py-2">
              <UButton
                :label="roleTarget === m.id ? (m.role === 'admin' ? '한 번 더 눌러 해제' : '한 번 더 눌러 지정') : (m.role === 'admin' ? '관리자 해제' : '관리자 지정')"
                size="xs"
                :color="roleTarget === m.id ? 'error' : 'neutral'"
                variant="outline"
                @click="changeRole(m)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else-if="!loading" class="mt-6 border border-default bg-white p-6 text-center text-sm text-muted">
      {{ q.trim() ? '검색 결과가 없습니다.' : '아직 가입한 회원이 없습니다.' }}
    </p>
  </UContainer>
</template>
