<script setup lang="ts">
import { partnerCategories } from '~/data/status'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useSeoMeta({ title: '협력업체 · 라자 관리자' })

interface Partner {
  id: string
  name: string
  category: string
  contact: string
  active: number
  total: number
  pending: number
}

const api = useApi('admin')
const toast = useToast()
const origin = useRequestURL().origin

const partners = ref<Partner[]>([])
const loading = ref(true)
const saving = ref(false)

const form = reactive({ id: '', name: '', category: '', contact: '' })
const created = ref<{ id: string, name: string, code: string } | null>(null)
const resetTarget = ref<string | null>(null)

async function load() {
  loading.value = true
  try {
    partners.value = await api<Partner[]>('/partners')
  } finally {
    loading.value = false
  }
}
onMounted(load)

const guide = computed(() =>
  created.value
    ? `[라자 협력업체 로그인]\n주소: ${origin}/partner/login\n로그인 ID: ${created.value.id}\n접속 코드: ${created.value.code}`
    : ''
)

async function copyGuide() {
  try {
    await navigator.clipboard.writeText(guide.value)
    toast.add({ title: '안내문을 복사했습니다', color: 'success' })
  } catch {
    toast.add({ title: '복사하지 못했습니다', description: '아래 내용을 직접 선택해서 복사해 주세요.', color: 'warning' })
  }
}

async function create() {
  saving.value = true
  try {
    const res = await api<{ id: string, code: string }>('/partners', { method: 'POST', body: { ...form } })
    created.value = { id: res.id, name: form.name, code: res.code }
    Object.assign(form, { id: '', name: '', category: '', contact: '' })
    await load()
  } catch (e) {
    toast.add({ title: errorMessage(e), color: 'error' })
  } finally {
    saving.value = false
  }
}

async function toggle(p: Partner, active: boolean) {
  try {
    await api(`/partners/${p.id}`, { method: 'PATCH', body: { active } })
    toast.add({ title: active ? '활성화했습니다' : '비활성화했습니다. 이 업체는 더 이상 로그인할 수 없습니다.', color: 'success' })
    await load()
  } catch (e) {
    toast.add({ title: errorMessage(e), color: 'error' })
  }
}

async function resetCode(p: Partner) {
  // 실수로 누르지 않도록 한 번 더 눌러야 재발급됩니다.
  if (resetTarget.value !== p.id) {
    resetTarget.value = p.id
    setTimeout(() => { if (resetTarget.value === p.id) resetTarget.value = null }, 4000)
    return
  }
  resetTarget.value = null
  try {
    const res = await api<{ code?: string }>(`/partners/${p.id}`, { method: 'PATCH', body: { resetCode: true } })
    if (res.code) created.value = { id: p.id, name: p.name, code: res.code }
  } catch (e) {
    toast.add({ title: errorMessage(e), color: 'error' })
  }
}
</script>

<template>
  <UContainer class="py-8">
    <h1 class="text-2xl font-extrabold text-highlighted">
      협력업체
    </h1>
    <p class="mt-1 text-sm text-muted">
      협력업체를 등록하면 로그인 ID와 접속 코드가 만들어집니다. 업체는 이 정보로 자기 예약만 확인합니다.
    </p>

    <UAlert
      v-if="created"
      class="mt-6"
      color="success"
      variant="subtle"
      icon="i-lucide-key-round"
      :title="`${created.name} 접속 정보 (이 화면에서만 볼 수 있습니다)`"
    >
      <template #description>
        <pre class="mt-2 whitespace-pre-wrap break-all bg-white p-3 font-mono text-sm text-highlighted">{{ guide }}</pre>
        <div class="mt-3 flex gap-2">
          <UButton label="안내문 복사" icon="i-lucide-copy" size="sm" @click="copyGuide" />
          <UButton label="닫기" color="neutral" variant="outline" size="sm" @click="created = null" />
        </div>
        <p class="mt-3 text-xs text-muted">
          접속 코드는 암호화되어 저장되므로 나중에 다시 볼 수 없습니다. 잃어버리면 "코드 재발급"을 누르세요.
        </p>
      </template>
    </UAlert>

    <form class="box3d mt-6 grid gap-4 border border-default bg-white p-5 sm:grid-cols-2 lg:grid-cols-5 lg:items-end" @submit.prevent="create">
      <div>
        <label for="pid" class="text-xs font-bold text-highlighted">로그인 ID (영문 소문자·숫자·-)</label>
        <UInput id="pid" v-model="form.id" placeholder="golf-a" class="mt-1 w-full" />
      </div>
      <div>
        <label for="pname" class="text-xs font-bold text-highlighted">업체명</label>
        <UInput id="pname" v-model="form.name" placeholder="○○ 골프" class="mt-1 w-full" />
      </div>
      <div>
        <label for="pcat" class="text-xs font-bold text-highlighted">분야</label>
        <USelect id="pcat" v-model="form.category" :items="partnerCategories" placeholder="선택" class="mt-1 w-full" />
      </div>
      <div>
        <label for="pcontact" class="text-xs font-bold text-highlighted">연락처 (선택)</label>
        <UInput id="pcontact" v-model="form.contact" placeholder="카카오톡 ID, 전화" class="mt-1 w-full" />
      </div>
      <UButton type="submit" label="협력업체 등록" icon="i-lucide-plus" :loading="saving" :disabled="!form.id || !form.name || !form.category" />
    </form>

    <div v-if="partners.length" class="mt-6 grid gap-4 md:grid-cols-2">
      <article v-for="p in partners" :key="p.id" class="border border-default bg-white p-5" :class="p.active ? '' : 'opacity-60'">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="font-bold text-highlighted">
              {{ p.name }}
            </h2>
            <p class="mt-0.5 font-mono text-xs text-muted">
              ID: {{ p.id }}
            </p>
          </div>
          <UBadge :label="p.category" color="primary" variant="subtle" />
        </div>
        <p v-if="p.contact" class="mt-2 text-sm text-muted">
          {{ p.contact }}
        </p>

        <div class="mt-3 flex gap-4 text-sm">
          <span>대기 <b class="text-amber-600">{{ p.pending }}</b></span>
          <span>전체 예약 <b>{{ p.total }}</b></span>
        </div>

        <div class="mt-4 flex flex-wrap items-center gap-3 border-t border-default pt-4">
          <label class="flex items-center gap-2 text-sm">
            <USwitch :model-value="!!p.active" @update:model-value="(v: boolean) => toggle(p, v)" />
            {{ p.active ? '활성' : '비활성' }}
          </label>
          <UButton
            class="ml-auto"
            size="sm"
            variant="outline"
            :color="resetTarget === p.id ? 'error' : 'neutral'"
            :label="resetTarget === p.id ? '정말 재발급할까요?' : '코드 재발급'"
            icon="i-lucide-refresh-cw"
            @click="resetCode(p)"
          />
        </div>
      </article>
    </div>
    <UEmpty v-else-if="!loading" class="mt-8" icon="i-lucide-handshake" title="등록된 협력업체가 없습니다" description="위 양식으로 첫 협력업체를 등록해 보세요." />
  </UContainer>
</template>
