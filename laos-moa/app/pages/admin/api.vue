<script setup lang="ts">
import { formatDateTime } from '~/data/status'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useSeoMeta({ title: 'API · 라자 관리자' })

interface Client {
  id: string
  name: string
  keyPrefix: string
  scopes: string[]
  ratePerMin: number
  active: boolean
  createdAt: string
  lastUsedAt: string | null
  requestCount: number
}
interface Scope { key: string, label: string }

const api = useApi('admin')
const toast = useToast()

const clients = ref<Client[]>([])
const scopes = ref<Scope[]>([])
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    const res = await api<{ scopes: Scope[], clients: Client[] }>('/api-clients')
    scopes.value = res.scopes
    clients.value = res.clients
  } finally {
    loading.value = false
  }
}
onMounted(load)

// 새 키 만들기
const name = ref('')
const picked = ref<string[]>(['auth'])
const rate = ref(120)
const saving = ref(false)
const newKey = ref('')

async function create() {
  if (saving.value) return
  saving.value = true
  try {
    const res = await api<{ key: string }>('/api-clients', { method: 'POST', body: { name: name.value, scopes: picked.value, ratePerMin: rate.value } })
    newKey.value = res.key
    name.value = ''
    picked.value = ['auth']
    await load()
  } catch (e) {
    toast.add({ title: errorMessage(e), color: 'error' })
  } finally {
    saving.value = false
  }
}

async function copy(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.add({ title: `${label}을(를) 복사했습니다`, color: 'success' })
  } catch {
    toast.add({ title: '복사하지 못했습니다. 직접 선택해서 복사해 주세요', color: 'warning' })
  }
}

async function toggle(c: Client) {
  try {
    await api(`/api-clients/${c.id}`, { method: 'PATCH', body: { active: !c.active } })
    toast.add({ title: c.active ? `${c.name} 키를 사용 중지했습니다` : `${c.name} 키를 다시 사용합니다`, color: 'success' })
    await load()
  } catch (e) {
    toast.add({ title: errorMessage(e), color: 'error' })
  }
}

// 실수로 지우지 않도록 한 번 더 눌러야 삭제됩니다.
const delTarget = ref<string | null>(null)
async function remove(c: Client) {
  if (delTarget.value !== c.id) {
    delTarget.value = c.id
    setTimeout(() => { if (delTarget.value === c.id) delTarget.value = null }, 4000)
    return
  }
  delTarget.value = null
  try {
    await api(`/api-clients/${c.id}`, { method: 'DELETE' })
    toast.add({ title: `${c.name} 키를 삭제했습니다`, color: 'success' })
    await load()
  } catch (e) {
    toast.add({ title: errorMessage(e), color: 'error' })
  }
}

const baseUrl = 'https://laja.joybox.day/api/v1'
const scopeLabel = (k: string) => scopes.value.find(s => s.key === k)?.label ?? k
</script>

<template>
  <UContainer class="py-8">
    <h1 class="text-2xl font-extrabold text-highlighted">
      API
    </h1>
    <p class="mt-1 max-w-2xl text-sm text-muted">
      다른 사이트가 회원가입·로그인·업체·예약·커뮤니티 자료를 가져가거나 쓸 수 있게 키를 발급합니다. 사이트마다 키를 따로 만들고, 필요한 권한만 주세요.
      회원 정보(실명·휴대폰)는 개인정보이니 꼭 필요한 사이트에만 <b>members:read</b> 권한을 주세요.
    </p>

    <section class="mt-5 border border-default bg-default p-4" aria-labelledby="base-title">
      <h2 id="base-title" class="text-sm font-extrabold text-highlighted">
        접속 주소
      </h2>
      <div class="mt-2 flex flex-wrap items-center gap-2">
        <code class="break-all bg-muted px-2 py-1 text-sm text-highlighted">{{ baseUrl }}</code>
        <UButton color="neutral" variant="outline" size="sm" type="button" @click="copy(baseUrl, '주소')">복사</UButton>
      </div>
      <p class="mt-2 text-xs text-muted">
        모든 요청에 <code>Authorization: Bearer 발급받은키</code> 헤더를 넣어요. 키는 다른 사이트의 <b>서버</b>에만 두고, 브라우저 코드에는 넣지 마세요.
      </p>
      <div class="mt-3">
        <UButton color="primary" variant="soft" size="md" icon="i-lucide-download" href="/api/admin/api-docs" download="laja-api-guide.md">
          API 연동 가이드 내려받기 (.md)
        </UButton>
        <p class="mt-1 text-xs text-muted">
          다른 사이트를 만드는 사람(또는 AI)에게 이 파일을 그대로 전달하세요. 키는 이 파일에 들어 있지 않아요.
        </p>
      </div>
    </section>

    <!-- 방금 만든 키: 이 화면에서만 볼 수 있어요 -->
    <section v-if="newKey" class="mt-5 border-2 border-primary bg-default p-4" aria-live="polite">
      <h2 class="text-sm font-extrabold text-highlighted">
        새 키가 만들어졌어요. 지금 복사해 두세요
      </h2>
      <p class="mt-1 text-xs text-muted">
        보안을 위해 키 원문은 저장하지 않아서 이 화면을 닫으면 다시 볼 수 없어요. 잃어버리면 새 키를 만들어야 해요.
      </p>
      <div class="mt-2 flex flex-wrap items-center gap-2">
        <code class="min-w-0 flex-1 break-all bg-muted px-2 py-2 text-sm font-bold text-highlighted">{{ newKey }}</code>
        <UButton color="primary" size="md" type="button" @click="copy(newKey, '키')">키 복사</UButton>
        <UButton color="neutral" variant="outline" size="md" type="button" @click="newKey = ''">복사했어요, 닫기</UButton>
      </div>
    </section>

    <section class="mt-5 border border-default bg-default p-4" aria-labelledby="new-title">
      <h2 id="new-title" class="text-sm font-extrabold text-highlighted">
        새 키 만들기
      </h2>
      <form class="mt-3 space-y-4" @submit.prevent="create">
        <div class="max-w-sm">
          <label for="api-name" class="text-sm font-bold text-highlighted">사이트 이름</label>
          <UInput id="api-name" v-model="name" class="mt-1 w-full" placeholder="예) 라오스 쇼핑몰" maxlength="40" />
        </div>
        <fieldset class="min-w-0">
          <legend class="text-sm font-bold text-highlighted">
            허용할 권한
          </legend>
          <div class="mt-2 grid gap-2 sm:grid-cols-2">
            <label v-for="s in scopes" :key="s.key" class="flex min-h-11 items-start gap-2 border border-default px-3 py-2 text-sm">
              <input v-model="picked" type="checkbox" :value="s.key" class="mt-1 size-4 accent-[var(--ui-primary)]">
              <span class="min-w-0"><b class="block text-highlighted">{{ s.key }}</b><span class="text-muted">{{ s.label }}</span></span>
            </label>
          </div>
        </fieldset>
        <div class="max-w-[12rem]">
          <label for="api-rate" class="text-sm font-bold text-highlighted">1분에 요청 횟수</label>
          <UInput id="api-rate" v-model.number="rate" type="number" min="10" max="1200" class="mt-1 w-full" />
        </div>
        <UButton type="submit" color="primary" size="lg" :loading="saving" :disabled="saving">
          키 만들기
        </UButton>
      </form>
    </section>

    <h2 class="mt-8 text-lg font-extrabold text-highlighted">
      발급한 키
    </h2>
    <p v-if="loading" class="mt-3 text-sm text-muted">
      불러오는 중…
    </p>
    <p v-else-if="!clients.length" class="mt-3 text-sm text-muted">
      아직 발급한 키가 없어요. 위에서 사이트 이름과 권한을 고르고 만들어 보세요.
    </p>
    <ul v-else class="mt-3 space-y-3">
      <li v-for="c in clients" :key="c.id" class="border border-default bg-default p-4" :class="c.active ? '' : 'opacity-70'">
        <div class="flex flex-wrap items-center gap-2">
          <p class="min-w-0 flex-1 text-base font-extrabold text-highlighted">
            {{ c.name }}
            <span class="ml-1 text-xs font-bold" :class="c.active ? 'text-primary' : 'text-muted'">{{ c.active ? '사용 중' : '중지됨' }}</span>
          </p>
          <UButton color="neutral" variant="outline" size="sm" type="button" @click="toggle(c)">{{ c.active ? '사용 중지' : '다시 사용' }}</UButton>
          <UButton :color="delTarget === c.id ? 'error' : 'neutral'" :variant="delTarget === c.id ? 'solid' : 'outline'" size="sm" type="button" @click="remove(c)">
            {{ delTarget === c.id ? '한 번 더 누르면 삭제' : '삭제' }}
          </UButton>
        </div>
        <p class="mt-1 text-sm text-muted">
          키 <code class="text-highlighted">{{ c.keyPrefix }}…</code> · 분당 {{ c.ratePerMin }}회 · 요청 {{ c.requestCount.toLocaleString('ko-KR') }}번 ·
          마지막 사용 {{ c.lastUsedAt ? formatDateTime(c.lastUsedAt) : '없음' }}
        </p>
        <ul class="mt-2 flex flex-wrap gap-1.5">
          <li v-for="s in c.scopes" :key="s" class="bg-muted px-2 py-1 text-xs font-bold text-highlighted" :title="scopeLabel(s)">
            {{ s }}
          </li>
        </ul>
      </li>
    </ul>
  </UContainer>
</template>
