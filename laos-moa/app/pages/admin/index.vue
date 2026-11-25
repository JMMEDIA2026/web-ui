<script setup lang="ts">
import type { StatusKey } from '~/data/status'
import { statusMeta } from '~/data/status'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useSeoMeta({ title: '대시보드 · 라오스모아 관리자' })

interface Summary {
  pending: number
  today: number
  total: number
  partners: number
  newInquiries: number
  recent: { id: string, customer_name: string, reserve_date: string, status: StatusKey, service: string, partner_name: string | null }[]
}

const api = useApi('admin')
const summary = ref<Summary>()

onMounted(async () => {
  summary.value = await api<Summary>('/summary')
})

const cards = computed(() => [
  { label: '답변 대기 예약', value: summary.value?.pending, to: '/admin/reservations?status=pending', icon: 'i-lucide-clock', tone: 'bg-amber-100 text-amber-700' },
  { label: '오늘 예약', value: summary.value?.today, to: '/admin/reservations', icon: 'i-lucide-calendar-days', tone: 'bg-blue-100 text-blue-700' },
  { label: '전체 예약', value: summary.value?.total, to: '/admin/reservations', icon: 'i-lucide-list-checks', tone: 'bg-emerald-100 text-emerald-700' },
  { label: '활동 중인 협력업체', value: summary.value?.partners, to: '/admin/partners', icon: 'i-lucide-handshake', tone: 'bg-violet-100 text-violet-700' },
  { label: '새 광고 문의', value: summary.value?.newInquiries, to: '/admin/inquiries', icon: 'i-lucide-inbox', tone: 'bg-rose-100 text-rose-700' }
])
</script>

<template>
  <UContainer class="py-8">
    <h1 class="text-2xl font-extrabold text-highlighted">
      대시보드
    </h1>
    <p class="mt-1 text-sm text-muted">
      예약과 문의 현황을 한눈에 확인하세요.
    </p>

    <div class="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
      <NuxtLink v-for="c in cards" :key="c.label" :to="c.to" class="box3d lift flex flex-col gap-3 border border-default bg-white p-4">
        <span class="flex size-10 items-center justify-center" :class="c.tone"><UIcon :name="c.icon" class="size-5" /></span>
        <span class="text-3xl font-extrabold tabular-nums text-highlighted">{{ c.value ?? '-' }}</span>
        <span class="text-xs text-muted">{{ c.label }}</span>
      </NuxtLink>
    </div>

    <section class="mt-8 border border-default bg-white">
      <div class="flex items-center justify-between border-b border-default px-5 py-3">
        <h2 class="font-bold text-highlighted">
          최근 예약
        </h2>
        <UButton to="/admin/reservations" label="전체 보기" variant="ghost" color="neutral" size="sm" trailing-icon="i-lucide-arrow-right" />
      </div>

      <ul v-if="summary?.recent.length" class="divide-y divide-default">
        <li v-for="r in summary.recent" :key="r.id" class="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 text-sm">
          <span class="font-mono font-bold">{{ r.id }}</span>
          <UBadge :label="statusMeta[r.status].label" :color="statusMeta[r.status].color" variant="subtle" />
          <span class="text-highlighted">{{ r.partner_name ?? '-' }}</span>
          <span class="text-muted">{{ r.customer_name }} · {{ r.reserve_date }}</span>
        </li>
      </ul>
      <p v-else class="px-5 py-10 text-center text-sm text-muted">
        아직 들어온 예약이 없습니다.
      </p>
    </section>
  </UContainer>
</template>
