<script setup lang="ts">
import { cropBanner } from '~/utils/image'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useSeoMeta({ title: '메인 배너 · 라자 관리자' })

interface BannerRow {
  id: string
  title: string
  advertiser: string
  link_url: string
  active: number
  sort_order: number
  starts_at: string
  ends_at: string
  clicks: number
  status: 'live' | 'hidden' | 'scheduled' | 'ended'
  v: number
}

const api = useApi('admin')
const toast = useToast()

const rows = ref<BannerRow[]>([])
const loading = ref(true)
const saving = ref(false)
const deleteTarget = ref<string | null>(null)

// 수정 중인 값(저장 전)
const edits = reactive<Record<string, { title: string, advertiser: string, linkUrl: string, startsAt: string, endsAt: string }>>({})

async function load() {
  loading.value = true
  try {
    rows.value = await api<BannerRow[]>('/banners')
    for (const b of rows.value) {
      edits[b.id] = { title: b.title, advertiser: b.advertiser, linkUrl: b.link_url, startsAt: b.starts_at, endsAt: b.ends_at }
    }
  } finally {
    loading.value = false
  }
}
onMounted(load)

const statusText: Record<BannerRow['status'], { label: string, color: 'success' | 'neutral' | 'warning' | 'error' }> = {
  live: { label: '노출 중', color: 'success' },
  hidden: { label: '숨김', color: 'neutral' },
  scheduled: { label: '예약됨', color: 'warning' },
  ended: { label: '종료', color: 'error' }
}

// ---- 새 배너 ----
const form = reactive({ title: '', advertiser: '', linkUrl: '', startsAt: '', endsAt: '' })
const imageB64 = ref('')
const preview = ref('')
const picking = ref(false)

async function pickImage(e: Event, forId?: string) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (!file.type.startsWith('image/')) {
    toast.add({ title: '이미지 파일을 골라 주세요', color: 'error' })
    return
  }
  picking.value = true
  try {
    const b64 = await cropBanner(file)
    if (forId) {
      await api(`/banners/${forId}`, { method: 'PATCH', body: { image: b64 } })
      toast.add({ title: '배너 이미지를 바꿨습니다', color: 'success' })
      await load()
    } else {
      imageB64.value = b64
      preview.value = `data:image/jpeg;base64,${b64}`
    }
  } catch (err) {
    toast.add({ title: errorMessage(err, '이미지를 처리하지 못했습니다'), color: 'error' })
  } finally {
    picking.value = false
  }
}

async function create() {
  saving.value = true
  try {
    await api('/banners', { method: 'POST', body: { ...form, image: imageB64.value } })
    toast.add({ title: '배너를 등록했습니다', color: 'success' })
    Object.assign(form, { title: '', advertiser: '', linkUrl: '', startsAt: '', endsAt: '' })
    imageB64.value = ''
    preview.value = ''
    await load()
  } catch (err) {
    toast.add({ title: errorMessage(err), color: 'error' })
  } finally {
    saving.value = false
  }
}

async function patch(id: string, body: Record<string, unknown>, message = '저장했습니다') {
  try {
    await api(`/banners/${id}`, { method: 'PATCH', body })
    toast.add({ title: message, color: 'success' })
    await load()
  } catch (err) {
    toast.add({ title: errorMessage(err), color: 'error' })
  }
}

const changed = (b: BannerRow) => {
  const e = edits[b.id]
  return !!e && (e.title !== b.title || e.advertiser !== b.advertiser || e.linkUrl !== b.link_url || e.startsAt !== b.starts_at || e.endsAt !== b.ends_at)
}

// 실수로 지우지 않도록 한 번 더 눌러야 삭제됩니다.
async function remove(id: string) {
  if (deleteTarget.value !== id) {
    deleteTarget.value = id
    setTimeout(() => { if (deleteTarget.value === id) deleteTarget.value = null }, 4000)
    return
  }
  deleteTarget.value = null
  try {
    await api(`/banners/${id}`, { method: 'DELETE' })
    toast.add({ title: '배너를 삭제했습니다', color: 'success' })
    await load()
  } catch (err) {
    toast.add({ title: errorMessage(err), color: 'error' })
  }
}
</script>

<template>
  <UContainer class="py-8">
    <h1 class="text-2xl font-extrabold text-highlighted">
      메인 배너
    </h1>
    <p class="mt-1 text-sm text-muted">
      메인 화면 맨 위에 슬라이드로 나오는 광고 배너입니다. 이미지는 <b>가로 2 : 세로 1</b> 비율(권장 1200×600)로 준비해 주세요. 다른 비율은 가운데를 기준으로 잘려서 보입니다. 배너가 하나도 없으면 기존 제목이 나옵니다.
    </p>

    <details class="box3d mt-6 border border-default bg-white" open>
      <summary class="cursor-pointer px-5 py-4 font-bold text-highlighted">
        + 새 배너 등록
      </summary>
      <form class="grid gap-4 border-t border-default p-5 sm:grid-cols-2" @submit.prevent="create">
        <div class="sm:col-span-2">
          <p class="text-xs font-bold text-highlighted">
            배너 이미지 (2:1로 자동 잘라서 줄입니다)
          </p>
          <input id="banner-new-image" type="file" accept="image/*" class="peer sr-only" :disabled="picking" @change="pickImage($event)">
          <label for="banner-new-image" class="mt-1 inline-flex cursor-pointer items-center gap-1.5 border border-default bg-white px-3 py-2 text-sm font-bold text-highlighted peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-primary peer-disabled:opacity-50">
            <UIcon name="i-lucide-image-plus" class="size-4" />
            {{ picking ? '처리 중…' : (preview ? '이미지 다시 고르기' : '이미지 고르기') }}
          </label>
          <img v-if="preview" :src="preview" alt="배너 미리보기" class="mt-3 aspect-[2/1] w-full max-w-md border border-default object-cover">
        </div>
        <div>
          <label for="bn-title" class="text-xs font-bold text-highlighted">배너 이름 (이미지 설명으로도 쓰입니다)</label>
          <UInput id="bn-title" v-model="form.title" placeholder="예) VIP 마사지 오픈 이벤트" class="mt-1 w-full" />
        </div>
        <div>
          <label for="bn-adv" class="text-xs font-bold text-highlighted">광고주 (관리자만 보임)</label>
          <UInput id="bn-adv" v-model="form.advertiser" class="mt-1 w-full" />
        </div>
        <div class="sm:col-span-2">
          <label for="bn-link" class="text-xs font-bold text-highlighted">눌렀을 때 이동할 주소 (선택) — https://… 또는 /businesses/vip-massage</label>
          <UInput id="bn-link" v-model="form.linkUrl" class="mt-1 w-full" />
        </div>
        <div>
          <label for="bn-start" class="text-xs font-bold text-highlighted">시작일 (비우면 바로 시작)</label>
          <UInput id="bn-start" v-model="form.startsAt" type="date" class="mt-1 w-full" />
        </div>
        <div>
          <label for="bn-end" class="text-xs font-bold text-highlighted">종료일 (비우면 계속 노출, 이 날까지 보임)</label>
          <UInput id="bn-end" v-model="form.endsAt" type="date" class="mt-1 w-full" />
        </div>
        <UButton type="submit" label="배너 등록" icon="i-lucide-plus" :loading="saving" :disabled="!imageB64 || !form.title.trim()" class="sm:col-span-2" />
      </form>
    </details>

    <div v-if="rows.length" class="mt-6 grid gap-4 md:grid-cols-2">
      <article v-for="(b, i) in rows" :key="b.id" class="border border-default bg-white p-5" :class="b.status === 'live' ? '' : 'opacity-80'">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <UBadge :label="statusText[b.status].label" :color="statusText[b.status].color" variant="subtle" />
            <span class="text-xs text-muted">클릭 {{ b.clicks.toLocaleString('ko-KR') }}회</span>
          </div>
          <div class="flex gap-1">
            <UButton icon="i-lucide-chevron-up" size="xs" color="neutral" variant="outline" aria-label="위로" :disabled="i === 0" @click="patch(b.id, { move: -1 }, '순서를 바꿨습니다')" />
            <UButton icon="i-lucide-chevron-down" size="xs" color="neutral" variant="outline" aria-label="아래로" :disabled="i === rows.length - 1" @click="patch(b.id, { move: 1 }, '순서를 바꿨습니다')" />
          </div>
        </div>

        <h2 class="mt-3 font-bold text-highlighted">
          {{ b.title }}
        </h2>
        <p v-if="b.advertiser" class="text-xs text-muted">
          광고주 {{ b.advertiser }}
        </p>
        <img :src="`/api/admin/banners/${b.id}/image?v=${b.v}`" :alt="`${b.title} 배너`" class="mt-2 aspect-[2/1] w-full border border-default object-cover">
        <div class="mt-2">
          <input :id="`bn-img-${b.id}`" type="file" accept="image/*" class="peer sr-only" :disabled="picking" @change="pickImage($event, b.id)">
          <label :for="`bn-img-${b.id}`" class="inline-flex cursor-pointer items-center gap-1.5 border border-default bg-white px-2.5 py-1.5 text-xs font-bold text-highlighted peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-primary peer-disabled:opacity-50">
            이미지 바꾸기
          </label>
        </div>

        <div v-if="edits[b.id]" class="mt-3 grid gap-3">
          <div>
            <label :for="`bn-t-${b.id}`" class="text-xs font-bold text-highlighted">배너 이름</label>
            <UInput :id="`bn-t-${b.id}`" v-model="edits[b.id]!.title" class="mt-1 w-full" />
          </div>
          <div>
            <label :for="`bn-a-${b.id}`" class="text-xs font-bold text-highlighted">광고주</label>
            <UInput :id="`bn-a-${b.id}`" v-model="edits[b.id]!.advertiser" class="mt-1 w-full" />
          </div>
          <div>
            <label :for="`bn-l-${b.id}`" class="text-xs font-bold text-highlighted">이동 주소</label>
            <UInput :id="`bn-l-${b.id}`" v-model="edits[b.id]!.linkUrl" class="mt-1 w-full" />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label :for="`bn-s-${b.id}`" class="text-xs font-bold text-highlighted">시작일</label>
              <UInput :id="`bn-s-${b.id}`" v-model="edits[b.id]!.startsAt" type="date" class="mt-1 w-full" />
            </div>
            <div>
              <label :for="`bn-e-${b.id}`" class="text-xs font-bold text-highlighted">종료일</label>
              <UInput :id="`bn-e-${b.id}`" v-model="edits[b.id]!.endsAt" type="date" class="mt-1 w-full" />
            </div>
          </div>
          <UButton
            label="변경 저장"
            size="sm"
            :disabled="!changed(b) || !edits[b.id]!.title.trim()"
            @click="patch(b.id, { title: edits[b.id]!.title, advertiser: edits[b.id]!.advertiser, linkUrl: edits[b.id]!.linkUrl, startsAt: edits[b.id]!.startsAt, endsAt: edits[b.id]!.endsAt })"
          />
        </div>

        <div class="mt-4 flex flex-wrap items-center gap-4 border-t border-default pt-4 text-sm">
          <label class="flex items-center gap-2">
            <USwitch :model-value="!!b.active" @update:model-value="(v: boolean) => patch(b.id, { active: v }, v ? '배너를 켰습니다' : '배너를 껐습니다')" />
            {{ b.active ? '켜짐' : '꺼짐' }}
          </label>
          <UButton :label="deleteTarget === b.id ? '한 번 더 눌러 삭제' : '삭제'" size="sm" :color="deleteTarget === b.id ? 'error' : 'neutral'" variant="outline" class="ml-auto" @click="remove(b.id)" />
        </div>
      </article>
    </div>
    <UEmpty v-else-if="!loading" class="mt-8" icon="i-lucide-images" title="등록된 배너가 없습니다" description="위의 '새 배너 등록'으로 첫 배너를 등록하세요." />
  </UContainer>
</template>
