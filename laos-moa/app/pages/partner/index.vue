<script setup lang="ts">
import type { Reservation, StatusKey } from '~/data/status'
import { statusMeta } from '~/data/status'

definePageMeta({ layout: 'admin', middleware: 'partner-auth' })
useSeoMeta({ title: '예약 확인 · 라자 협력업체' })

const api = useApi('partner')
const toast = useToast()

const me = ref<{ id: string, name: string, category: string }>()
const rows = ref<Reservation[]>([])
const loading = ref(true)
const tab = ref<'' | StatusKey>('pending')

async function load() {
  loading.value = true
  try {
    rows.value = await api<Reservation[]>('/reservations')
  } finally {
    loading.value = false
  }
}

let timer: ReturnType<typeof setInterval> | undefined
onMounted(async () => {
  me.value = await api('/me')
  await load()
  // 새 예약이 들어왔는지 1분마다 확인합니다.
  timer = setInterval(load, 60_000)
})
onBeforeUnmount(() => clearInterval(timer))

const counts = computed(() => {
  const result: Record<string, number> = { '': rows.value.length }
  for (const r of rows.value) result[r.status] = (result[r.status] ?? 0) + 1
  return result
})

const shown = computed(() => (tab.value ? rows.value.filter(r => r.status === tab.value) : rows.value))

const tabs = [
  { label: '대기', value: 'pending' as const },
  { label: '확정', value: 'confirmed' as const },
  { label: '완료', value: 'completed' as const },
  { label: '거절', value: 'declined' as const },
  { label: '전체', value: '' as const }
]

async function update(id: string, patch: { status?: StatusKey, partnerMemo?: string }) {
  try {
    await api(`/reservations/${id}`, { method: 'PATCH', body: patch })
    toast.add({ title: patch.status ? `${statusMeta[patch.status].label} 처리했습니다` : '메모를 저장했습니다', color: 'success' })
    await load()
  } catch (e) {
    toast.add({ title: errorMessage(e), color: 'error' })
  }
}
</script>

<template>
  <UContainer class="py-8">
    <h1 class="text-2xl font-extrabold text-highlighted">
      {{ me?.name ?? '' }} 예약 확인
    </h1>
    <p class="mt-1 text-sm text-muted">
      들어온 예약을 확인하고 확정하거나 거절해 주세요. 확정하면 고객에게 연락해 주세요.
    </p>

    <div class="mt-5 flex flex-wrap gap-2">
      <UButton
        v-for="t in tabs"
        :key="t.value"
        :label="`${t.label} ${counts[t.value] ?? 0}`"
        size="sm"
        :color="tab === t.value ? 'primary' : 'neutral'"
        :variant="tab === t.value ? 'solid' : 'outline'"
        :class="tab === t.value ? '' : 'bg-white'"
        @click="tab = t.value"
      />
      <UButton icon="i-lucide-refresh-cw" size="sm" color="neutral" variant="ghost" label="새로고침" :loading="loading" @click="load" />
    </div>

    <div v-if="shown.length" class="mt-5 flex flex-col gap-4">
      <ReservationCard v-for="r in shown" :key="r.id" :reservation="r" mode="partner" @update="update" />
    </div>
    <UEmpty v-else-if="!loading" class="mt-8" icon="i-lucide-calendar-x" title="해당하는 예약이 없습니다" description="새 예약이 들어오면 이 화면에 표시됩니다." />
  </UContainer>
</template>
