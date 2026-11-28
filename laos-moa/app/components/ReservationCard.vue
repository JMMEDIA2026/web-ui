<script setup lang="ts">
import type { Reservation, StatusKey } from '~/data/status'
import { formatDateTime, statusMeta, statusOptions } from '~/data/status'

const props = defineProps<{
  reservation: Reservation
  mode: 'admin' | 'partner'
}>()

const emit = defineEmits<{
  update: [id: string, patch: { status?: StatusKey, partnerMemo?: string }]
}>()

const toast = useToast()
const memo = ref(props.reservation.partner_memo)
watch(() => props.reservation.partner_memo, (value) => { memo.value = value })

const meta = computed(() => statusMeta[props.reservation.status])
const memoChanged = computed(() => memo.value !== props.reservation.partner_memo)

// 협력업체가 누를 수 있는 버튼은 현재 상태에 따라 달라집니다.
const partnerActions = computed(() => {
  switch (props.reservation.status) {
    case 'pending':
      return [
        { label: '예약 확정', value: 'confirmed' as StatusKey, color: 'success' as const },
        { label: '거절', value: 'declined' as StatusKey, color: 'error' as const }
      ]
    case 'confirmed':
      return [
        { label: '이용 완료', value: 'completed' as StatusKey, color: 'neutral' as const },
        { label: '거절', value: 'declined' as StatusKey, color: 'error' as const }
      ]
    default:
      return []
  }
})

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.add({ title: '복사했습니다', color: 'success' })
  } catch {
    toast.add({ title: '복사하지 못했습니다', description: '직접 선택해서 복사해 주세요.', color: 'warning' })
  }
}
</script>

<template>
  <article class="border border-default bg-default p-5" :class="reservation.status === 'pending' ? 'border-l-4 border-l-amber-400' : ''">
    <div class="flex flex-wrap items-center gap-2">
      <span class="font-mono text-sm font-bold text-highlighted">{{ reservation.id }}</span>
      <UBadge :label="meta.label" :color="meta.color" variant="subtle" />
      <span v-if="mode === 'admin' && reservation.partner_name" class="text-sm text-muted">· {{ reservation.partner_name }}</span>
      <span class="ml-auto text-xs text-muted">접수 {{ formatDateTime(reservation.created_at) }}</span>
    </div>

    <dl class="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm lg:grid-cols-4">
      <div>
        <dt class="text-xs text-muted">
          예약일
        </dt>
        <dd class="text-base font-bold text-highlighted">
          {{ reservation.reserve_date }}
        </dd>
      </div>
      <div>
        <dt class="text-xs text-muted">
          인원
        </dt>
        <dd class="text-base font-bold text-highlighted">
          {{ reservation.people }}명
        </dd>
      </div>
      <div>
        <dt class="text-xs text-muted">
          고객
        </dt>
        <dd class="font-medium text-highlighted">
          {{ reservation.customer_name }}
        </dd>
      </div>
      <div>
        <dt class="text-xs text-muted">
          연락처
        </dt>
        <dd class="flex items-center gap-1 font-medium text-highlighted">
          <span class="break-all">{{ reservation.customer_contact }}</span>
          <UButton icon="i-lucide-copy" variant="ghost" color="neutral" size="xs" aria-label="연락처 복사" @click="copy(reservation.customer_contact)" />
        </dd>
      </div>
      <div v-if="reservation.service" class="col-span-2">
        <dt class="text-xs text-muted">
          서비스
        </dt>
        <dd class="text-highlighted">
          {{ reservation.service }}
        </dd>
      </div>
      <div v-if="reservation.note" class="col-span-2 lg:col-span-4">
        <dt class="text-xs text-muted">
          요청 사항
        </dt>
        <dd class="whitespace-pre-wrap text-highlighted">
          {{ reservation.note }}
        </dd>
      </div>
    </dl>

    <div class="mt-4 flex flex-col gap-3 border-t border-default pt-4 lg:flex-row lg:items-end">
      <div class="flex-1">
        <label :for="`memo-${reservation.id}`" class="text-xs text-muted">{{ mode === 'admin' ? '업체 메모' : '고객에게 전달할 메모 (선택)' }}</label>
        <div class="mt-1 flex gap-2">
          <UInput :id="`memo-${reservation.id}`" v-model="memo" maxlength="500" placeholder="예) 픽업 시간 09:00, 호텔 로비에서 만나요" class="flex-1" />
          <UButton label="메모 저장" color="neutral" variant="outline" :disabled="!memoChanged" @click="emit('update', reservation.id, { partnerMemo: memo })" />
        </div>
      </div>

      <div v-if="mode === 'admin'" class="lg:w-40">
        <label :for="`status-${reservation.id}`" class="text-xs text-muted">상태 변경</label>
        <USelect
          :id="`status-${reservation.id}`"
          :model-value="reservation.status"
          :items="statusOptions"
          class="mt-1 w-full"
          @update:model-value="(v: StatusKey) => emit('update', reservation.id, { status: v })"
        />
      </div>

      <div v-else-if="partnerActions.length" class="flex gap-2">
        <UButton
          v-for="a in partnerActions"
          :key="a.value"
          :label="a.label"
          :color="a.color"
          :variant="a.value === 'declined' ? 'outline' : 'solid'"
          @click="emit('update', reservation.id, { status: a.value })"
        />
      </div>
    </div>
  </article>
</template>
