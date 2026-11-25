<script setup lang="ts">
import { categories } from '~/data/businesses'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useSeoMeta({ title: '업체 · 라자 관리자' })

interface Biz {
  id: string
  name: string
  category: string
  area: string
  address: string
  lat: number | null
  lng: number | null
  hours: string
  contact: string
  map_url: string
  partner_id: string | null
  partner_name: string | null
  sponsored: number
  active: number
  photo_ids: string | null
}
interface PartnerOption {
  id: string
  name: string
}

const api = useApi('admin')
const toast = useToast()

const rows = ref<Biz[]>([])
const partners = ref<PartnerOption[]>([])
const loading = ref(true)
const saving = ref(false)

// 선택 목록에는 빈 문자열을 쓸 수 없어서 "연결 안 함"을 특별한 값으로 표현합니다.
const NONE = '__none__'

async function load() {
  loading.value = true
  try {
    const [b, p] = await Promise.all([api<Biz[]>('/businesses'), api<PartnerOption[]>('/partners')])
    rows.value = b
    partners.value = p
  } finally {
    loading.value = false
  }
}
onMounted(load)

const categoryLabel = Object.fromEntries(categories.map(c => [c.key, c.label])) as Record<string, string>
const categoryItems = categories.map(c => ({ label: c.label, value: c.key }))
const partnerItems = computed(() => [
  { label: '연결 안 함', value: NONE },
  ...partners.value.map(p => ({ label: `${p.name} (${p.id})`, value: p.id }))
])

// ---- 업체 사진 ----
// 사진은 올리기 전에 브라우저에서 줄입니다. (큰 사진 1600px, 작은 사진 480px)
const MAX_PHOTOS = 12
const uploadingId = ref<string | null>(null)
const deleteTarget = ref<string | null>(null)
const photosOf = (b: Biz) => (b.photo_ids ? b.photo_ids.split(',') : [])

async function uploadPhotos(b: Biz, e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  input.value = ''
  if (!files.length) return
  const room = MAX_PHOTOS - photosOf(b).length
  if (room <= 0) {
    toast.add({ title: `사진은 업체마다 ${MAX_PHOTOS}장까지 올릴 수 있습니다`, color: 'warning' })
    return
  }
  uploadingId.value = b.id
  let done = 0
  for (const f of files.slice(0, room)) {
    if (!f.type.startsWith('image/')) {
      toast.add({ title: `${f.name}: 이미지 파일이 아닙니다`, color: 'error' })
      continue
    }
    try {
      const full = await shrinkImage(f, FULL_MAX_SIDE, FULL_MAX_CHARS)
      const thumb = await shrinkImage(f, THUMB_MAX_SIDE, THUMB_MAX_CHARS)
      await api(`/businesses/${b.id}/photos`, { method: 'POST', body: { full, thumb } })
      done++
    } catch (err) {
      toast.add({ title: `${f.name}: ${errorMessage(err, '올리지 못했습니다')}`, color: 'error' })
    }
  }
  if (files.length > room) toast.add({ title: `${MAX_PHOTOS}장까지만 올릴 수 있어 ${files.length - room}장은 건너뛰었습니다`, color: 'warning' })
  uploadingId.value = null
  if (done) toast.add({ title: `사진 ${done}장을 올렸습니다`, color: 'success' })
  await load()
}

async function setCover(photoId: string) {
  try {
    await api(`/photos/${photoId}/cover`, { method: 'POST' })
    toast.add({ title: '대표(썸네일) 사진으로 지정했습니다', color: 'success' })
    await load()
  } catch (err) {
    toast.add({ title: errorMessage(err), color: 'error' })
  }
}

// 실수로 지우지 않도록 한 번 더 눌러야 삭제됩니다.
async function removePhoto(photoId: string) {
  if (deleteTarget.value !== photoId) {
    deleteTarget.value = photoId
    setTimeout(() => { if (deleteTarget.value === photoId) deleteTarget.value = null }, 4000)
    return
  }
  deleteTarget.value = null
  try {
    await api(`/photos/${photoId}`, { method: 'DELETE' })
    toast.add({ title: '사진을 삭제했습니다', color: 'success' })
    await load()
  } catch (err) {
    toast.add({ title: errorMessage(err), color: 'error' })
  }
}

async function patch(id: string, body: Record<string, unknown>, message = '저장했습니다') {
  try {
    await api(`/businesses/${id}`, { method: 'PATCH', body })
    toast.add({ title: message, color: 'success' })
    await load()
  } catch (e) {
    toast.add({ title: errorMessage(e), color: 'error' })
  }
}

function setPartner(b: Biz, value: string) {
  patch(b.id, { partnerId: value === NONE ? null : value }, value === NONE ? '사장님 계정 연결을 해제했습니다' : '사장님 계정을 연결했습니다')
}

const form = reactive({ id: '', name: '', category: '', area: '', address: '', lat: '', lng: '', hours: '', contact: '', mapUrl: '', description: '' })

async function create() {
  saving.value = true
  try {
    const toNumber = (v: string) => (v.trim() === '' ? null : Number(v))
    await api('/businesses', {
      method: 'POST',
      body: { ...form, lat: toNumber(form.lat), lng: toNumber(form.lng) }
    })
    toast.add({ title: '업체를 등록했습니다', color: 'success' })
    Object.assign(form, { id: '', name: '', category: '', area: '', address: '', lat: '', lng: '', hours: '', contact: '', mapUrl: '', description: '' })
    await load()
  } catch (e) {
    toast.add({ title: errorMessage(e), color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UContainer class="py-8">
    <h1 class="text-2xl font-extrabold text-highlighted">
      업체
    </h1>
    <p class="mt-1 text-sm text-muted">
      사이트의 업체 목록과 지도에 나오는 업체입니다. 사장님 계정(협력업체)을 연결하면 그 업체에 "예약 요청하기" 버튼이 생깁니다.
    </p>

    <details class="box3d mt-6 border border-default bg-white">
      <summary class="cursor-pointer px-5 py-4 font-bold text-highlighted">
        + 새 업체 등록
      </summary>
      <form class="grid gap-4 border-t border-default p-5 sm:grid-cols-2" @submit.prevent="create">
        <div>
          <label for="b-id" class="text-xs font-bold text-highlighted">주소용 ID (영문 소문자·숫자·-)</label>
          <UInput id="b-id" v-model="form.id" placeholder="vip-massage" class="mt-1 w-full" />
        </div>
        <div>
          <label for="b-name" class="text-xs font-bold text-highlighted">업체명</label>
          <UInput id="b-name" v-model="form.name" class="mt-1 w-full" />
        </div>
        <div>
          <label for="b-cat" class="text-xs font-bold text-highlighted">분야</label>
          <USelect id="b-cat" v-model="form.category" :items="categoryItems" placeholder="선택" class="mt-1 w-full" />
        </div>
        <div>
          <label for="b-area" class="text-xs font-bold text-highlighted">지역</label>
          <UInput id="b-area" v-model="form.area" placeholder="비엔티안 · 짠타부리" class="mt-1 w-full" />
        </div>
        <div class="sm:col-span-2">
          <label for="b-addr" class="text-xs font-bold text-highlighted">주소</label>
          <UInput id="b-addr" v-model="form.address" class="mt-1 w-full" />
        </div>
        <div>
          <label for="b-lat" class="text-xs font-bold text-highlighted">위도 (예: 17.965105)</label>
          <UInput id="b-lat" v-model="form.lat" inputmode="decimal" class="mt-1 w-full" />
        </div>
        <div>
          <label for="b-lng" class="text-xs font-bold text-highlighted">경도 (예: 102.604561)</label>
          <UInput id="b-lng" v-model="form.lng" inputmode="decimal" class="mt-1 w-full" />
        </div>
        <div>
          <label for="b-hours" class="text-xs font-bold text-highlighted">영업시간 (확인된 것만)</label>
          <UInput id="b-hours" v-model="form.hours" class="mt-1 w-full" />
        </div>
        <div>
          <label for="b-contact" class="text-xs font-bold text-highlighted">연락처 (확인된 것만)</label>
          <UInput id="b-contact" v-model="form.contact" class="mt-1 w-full" />
        </div>
        <div class="sm:col-span-2">
          <label for="b-map" class="text-xs font-bold text-highlighted">지도 주소 (https://…)</label>
          <UInput id="b-map" v-model="form.mapUrl" class="mt-1 w-full" />
        </div>
        <div class="sm:col-span-2">
          <label for="b-desc" class="text-xs font-bold text-highlighted">소개 (확인된 내용만)</label>
          <UTextarea id="b-desc" v-model="form.description" :rows="3" class="mt-1 w-full" />
        </div>
        <UButton type="submit" label="업체 등록" icon="i-lucide-plus" :loading="saving" :disabled="!form.id || !form.name || !form.category" class="sm:col-span-2" />
      </form>
    </details>

    <div v-if="rows.length" class="mt-6 grid gap-4 md:grid-cols-2">
      <article v-for="b in rows" :key="b.id" class="border border-default bg-white p-5" :class="b.active ? '' : 'opacity-60'">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h2 class="font-bold text-highlighted">
              {{ b.name }}
            </h2>
            <p class="mt-0.5 font-mono text-xs text-muted">
              /businesses/{{ b.id }}
            </p>
          </div>
          <UBadge :label="categoryLabel[b.category] ?? b.category" color="primary" variant="subtle" />
        </div>

        <p v-if="b.address" class="mt-2 break-words text-sm text-muted">
          {{ b.address }}
        </p>
        <p class="mt-1 text-xs text-muted">
          <template v-if="b.lat !== null && b.lng !== null">위치 {{ b.lat }}, {{ b.lng }}</template>
          <template v-else>위치(좌표) 없음 — 지도에 표시되지 않습니다</template>
        </p>

        <div class="mt-4">
          <label :for="`partner-${b.id}`" class="text-xs font-bold text-highlighted">사장님 계정 연결 (협력업체)</label>
          <USelect
            :id="`partner-${b.id}`"
            :model-value="b.partner_id ?? NONE"
            :items="partnerItems"
            class="mt-1 w-full"
            @update:model-value="(v: string) => setPartner(b, v)"
          />
          <p class="mt-1 text-xs text-muted">
            {{ b.partner_id ? '연결됨: 이 업체에 예약 요청 버튼이 보입니다.' : '연결 전: 예약 버튼이 보이지 않습니다. 먼저 "협력업체"에서 사장님 계정을 만드세요.' }}
          </p>
        </div>

        <div class="mt-4 border-t border-default pt-4">
          <p class="text-xs font-bold text-highlighted">
            사진 {{ photosOf(b).length }}/{{ MAX_PHOTOS }} · 첫 번째가 대표(썸네일)
          </p>
          <ul v-if="photosOf(b).length" class="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
            <li v-for="(pid, i) in photosOf(b)" :key="pid" class="relative">
              <img :src="`/api/photos/${pid}?size=thumb`" :alt="`${b.name} 사진 ${i + 1}`" class="aspect-square w-full border border-default object-cover">
              <span v-if="i === 0" class="absolute left-1 top-1 bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">대표</span>
              <div class="mt-1 flex flex-wrap gap-1">
                <UButton v-if="i > 0" label="대표로" size="xs" color="neutral" variant="outline" @click="setCover(pid)" />
                <UButton :label="deleteTarget === pid ? '한 번 더' : '삭제'" size="xs" :color="deleteTarget === pid ? 'error' : 'neutral'" variant="outline" @click="removePhoto(pid)" />
              </div>
            </li>
          </ul>
          <p v-else class="mt-1 text-xs text-muted">
            아직 사진이 없습니다. 사진이 없으면 업종 아이콘이 대신 보입니다.
          </p>
          <div class="mt-3">
            <input :id="`photo-${b.id}`" type="file" accept="image/*" multiple class="peer sr-only" :disabled="uploadingId === b.id || photosOf(b).length >= MAX_PHOTOS" @change="uploadPhotos(b, $event)">
            <label
              :for="`photo-${b.id}`"
              class="inline-flex cursor-pointer items-center gap-1.5 border border-default bg-white px-3 py-2 text-sm font-bold text-highlighted peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
            >
              <UIcon name="i-lucide-image-plus" class="size-4" />
              {{ uploadingId === b.id ? '올리는 중…' : '사진 올리기 (여러 장 가능)' }}
            </label>
            <p class="mt-1 text-xs text-muted">
              가게 전경, 내부, 간판 사진을 올려 주세요. 사진은 자동으로 줄여서 저장됩니다.
            </p>
          </div>
        </div>

        <div class="mt-4 flex flex-wrap items-center gap-4 border-t border-default pt-4 text-sm">
          <label class="flex items-center gap-2">
            <USwitch :model-value="!!b.active" @update:model-value="(v: boolean) => patch(b.id, { active: v }, v ? '사이트에 다시 보입니다' : '사이트에서 숨겼습니다')" />
            {{ b.active ? '사이트에 표시' : '숨김' }}
          </label>
          <label class="flex items-center gap-2">
            <USwitch :model-value="!!b.sponsored" @update:model-value="(v: boolean) => patch(b.id, { sponsored: v }, v ? '추천 업체로 표시했습니다' : '추천 표시를 껐습니다')" />
            추천(광고)
          </label>
          <UButton :to="`/businesses/${b.id}`" target="_blank" label="사이트에서 보기" size="sm" color="neutral" variant="outline" class="ml-auto" />
        </div>
      </article>
    </div>
    <UEmpty v-else-if="!loading" class="mt-8" icon="i-lucide-store" title="등록된 업체가 없습니다" description="위의 '새 업체 등록'으로 첫 업체를 등록하세요." />
  </UContainer>
</template>
