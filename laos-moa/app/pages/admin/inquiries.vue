<script setup lang="ts">
import { formatDateTime } from '~/data/status'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useSeoMeta({ title: '광고 문의 · 라자 관리자' })

interface Inquiry {
  id: string
  company: string
  contact: string
  product: string
  message: string
  status: 'new' | 'done'
  created_at: string
}

const api = useApi('admin')
const toast = useToast()
const rows = ref<Inquiry[]>([])
const loading = ref(true)

const productLabel: Record<string, string> = {
  free: '무료 업체 등록',
  premium: '프리미엄 업체',
  banner: '배너 광고',
  correction: '정보 수정 제안',
  etc: '제휴·기타',
  partner: '협력업체 가입 신청'
}

async function load() {
  loading.value = true
  try {
    rows.value = await api<Inquiry[]>('/inquiries')
  } finally {
    loading.value = false
  }
}
onMounted(load)

async function mark(row: Inquiry, status: 'new' | 'done') {
  try {
    await api(`/inquiries/${row.id}`, { method: 'PATCH', body: { status } })
    await load()
  } catch (e) {
    toast.add({ title: errorMessage(e), color: 'error' })
  }
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.add({ title: '복사했습니다', color: 'success' })
  } catch {
    toast.add({ title: '복사하지 못했습니다', color: 'warning' })
  }
}
</script>

<template>
  <UContainer class="py-8">
    <h1 class="text-2xl font-extrabold text-highlighted">
      광고·제휴 문의
    </h1>
    <p class="mt-1 text-sm text-muted">
      사이트의 "광고·제휴 문의" 폼으로 들어온 내용입니다.
    </p>

    <div v-if="rows.length" class="mt-6 flex flex-col gap-4">
      <article v-for="q in rows" :key="q.id" class="border border-default bg-default p-5" :class="q.status === 'new' ? 'border-l-4 border-l-rose-400' : ''">
        <div class="flex flex-wrap items-center gap-2">
          <span class="font-bold text-highlighted">{{ q.company }}</span>
          <UBadge :label="productLabel[q.product] ?? q.product" color="primary" variant="subtle" />
          <UBadge v-if="q.status === 'new'" label="새 문의" color="error" variant="subtle" />
          <span class="ml-auto text-xs text-muted">{{ formatDateTime(q.created_at) }}</span>
        </div>
        <p class="mt-3 flex items-center gap-1 text-sm">
          <span class="text-muted">연락처</span>
          <b class="break-all text-highlighted">{{ q.contact }}</b>
          <UButton icon="i-lucide-copy" variant="ghost" color="neutral" size="xs" aria-label="연락처 복사" @click="copy(q.contact)" />
        </p>
        <p v-if="q.message" class="mt-2 whitespace-pre-wrap text-sm text-highlighted">
          {{ q.message }}
        </p>
        <div class="mt-4">
          <UButton
            v-if="q.status === 'new'"
            label="처리 완료로 표시"
            icon="i-lucide-check"
            size="sm"
            @click="mark(q, 'done')"
          />
          <UButton v-else label="다시 새 문의로" color="neutral" variant="outline" size="sm" @click="mark(q, 'new')" />
        </div>
      </article>
    </div>
    <UEmpty v-else-if="!loading" class="mt-8" icon="i-lucide-inbox" title="문의가 없습니다" description="새 문의가 들어오면 여기에 표시됩니다." />
  </UContainer>
</template>
