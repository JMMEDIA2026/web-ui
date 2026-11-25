<script setup lang="ts">
import type { Reservation, StatusKey } from '~/data/status'
import { statusMeta } from '~/data/status'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useSeoMeta({ title: '예약 · 라자 관리자' })

const api = useApi('admin')
const route = useRoute()
const router = useRouter()
const toast = useToast()

const status = computed(() => (typeof route.query.status === 'string' ? route.query.status : ''))
const rows = ref<Reservation[]>([])
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    rows.value = await api<Reservation[]>('/reservations', { query: status.value ? { status: status.value } : {} })
  } finally {
    loading.value = false
  }
}

watch(status, load)
onMounted(load)

async function update(id: string, patch: { status?: StatusKey, partnerMemo?: string }) {
  try {
    await api(`/reservations/${id}`, { method: 'PATCH', body: patch })
    toast.add({ title: '저장했습니다', color: 'success' })
    await load()
  } catch (e) {
    toast.add({ title: errorMessage(e), color: 'error' })
  }
}

const tabs = [
  { label: '전체', value: '' },
  ...Object.entries(statusMeta).map(([value, meta]) => ({ label: meta.label, value }))
]

function pick(value: string) {
  router.replace({ query: value ? { status: value } : {} })
}
</script>

<template>
  <UContainer class="py-8">
    <h1 class="text-2xl font-extrabold text-highlighted">
      예약
    </h1>
    <p class="mt-1 text-sm text-muted">
      모든 협력업체의 예약 요청을 확인하고 상태를 바꿀 수 있습니다.
    </p>

    <div class="mt-5 flex flex-wrap gap-2">
      <UButton
        v-for="t in tabs"
        :key="t.value"
        :label="t.label"
        size="sm"
        :color="status === t.value ? 'primary' : 'neutral'"
        :variant="status === t.value ? 'solid' : 'outline'"
        :class="status === t.value ? '' : 'bg-white'"
        @click="pick(t.value)"
      />
      <UButton icon="i-lucide-refresh-cw" size="sm" color="neutral" variant="ghost" label="새로고침" :loading="loading" @click="load" />
    </div>

    <div v-if="rows.length" class="mt-5 flex flex-col gap-4">
      <ReservationCard v-for="r in rows" :key="r.id" :reservation="r" mode="admin" @update="update" />
    </div>
    <UEmpty v-else-if="!loading" class="mt-8" icon="i-lucide-calendar-x" title="예약이 없습니다" description="새 예약 요청이 들어오면 여기에 표시됩니다." />
  </UContainer>
</template>
