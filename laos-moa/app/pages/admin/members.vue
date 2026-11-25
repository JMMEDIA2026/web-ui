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
}

const api = useApi('admin')
const toast = useToast()

const rows = ref<MemberRow[]>([])
const total = ref(0)
const last7 = ref(0)
const loading = ref(true)
const q = ref('')

const genderText: Record<string, string> = { M: '남성', F: '여성', N: '선택 안 함' }

async function load() {
  loading.value = true
  try {
    const res = await api<{ total: number, last7: number, members: MemberRow[] }>('/members', { query: q.value.trim() ? { q: q.value.trim() } : {} })
    rows.value = res.members
    total.value = res.total
    last7.value = res.last7
  } finally {
    loading.value = false
  }
}
onMounted(load)

let timer: ReturnType<typeof setTimeout> | undefined
watch(q, () => {
  clearTimeout(timer)
  timer = setTimeout(load, 300)
})

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

    <div class="mt-5 max-w-md">
      <label for="member-search" class="sr-only">회원 검색</label>
      <UInput id="member-search" v-model="q" icon="i-lucide-search" placeholder="닉네임, 이름, 이메일, 휴대폰 번호로 검색" class="w-full" />
    </div>

    <p class="mt-3 text-sm text-muted" aria-live="polite">
      <template v-if="q.trim()">
        검색 결과 {{ rows.length }}명
      </template>
      <template v-else-if="rows.length < total">
        최근 가입한 {{ rows.length }}명을 보여 줍니다. 더 찾으려면 검색을 이용하세요.
      </template>
    </p>

    <div v-if="rows.length" class="mt-3 overflow-x-auto border border-default bg-white">
      <table class="w-full min-w-[860px] text-left text-sm">
        <thead class="bg-slate-50 text-xs text-muted">
          <tr>
            <th scope="col" class="px-3 py-2 font-bold">닉네임</th>
            <th scope="col" class="px-3 py-2 font-bold">실명</th>
            <th scope="col" class="px-3 py-2 font-bold">이메일</th>
            <th scope="col" class="px-3 py-2 font-bold">휴대폰</th>
            <th scope="col" class="px-3 py-2 font-bold">성별</th>
            <th scope="col" class="px-3 py-2 font-bold">가입일</th>
            <th scope="col" class="px-3 py-2 font-bold">최근 로그인</th>
            <th scope="col" class="px-3 py-2 text-right font-bold">예약</th>
            <th scope="col" class="px-3 py-2 text-right font-bold">문의</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-default">
          <tr v-for="m in rows" :key="m.id">
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
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else-if="!loading" class="mt-6 border border-default bg-white p-6 text-center text-sm text-muted">
      {{ q.trim() ? '검색 결과가 없습니다.' : '아직 가입한 회원이 없습니다.' }}
    </p>
  </UContainer>
</template>
