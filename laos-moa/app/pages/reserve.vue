<script setup lang="ts">
useSeoMeta({
  title: '예약 요청 · 라자',
  description: '라자 협력업체(골프, 마사지, 오토바이 렌트 등)에 예약을 요청하세요.'
})

interface PartnerOption {
  id: string
  name: string
  category: string
}

const route = useRoute()
const toast = useToast()

const { data: partners } = await useFetch<PartnerOption[]>('/api/partners', { default: () => [] })

// 라오스 시간(UTC+7) 기준 오늘 날짜
const today = new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10)

const form = reactive({
  partnerId: typeof route.query.partner === 'string' ? route.query.partner : '',
  name: '',
  contact: '',
  date: '',
  people: 1,
  service: '',
  note: '',
  website: ''
})

const loading = ref(false)
const error = ref('')
const doneCode = ref('')

const canSubmit = computed(() => form.partnerId && form.name.trim() && form.contact.trim().length >= 2 && form.date && form.people >= 1)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    const res = await $fetch<{ code: string }>('/api/reservations', { method: 'POST', body: { ...form } })
    doneCode.value = res.code
    toast.add({ title: '예약 요청을 보냈어요', color: 'success' })
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}

function reset() {
  doneCode.value = ''
  Object.assign(form, { name: '', contact: '', date: '', people: 1, service: '', note: '', website: '' })
}
</script>

<template>
  <div class="px-4 pt-3 sm:px-5">
    <div class="flex items-center gap-1">
      <NuxtLink to="/me" class="-ml-2 grid size-11 place-items-center rounded-full text-ink" aria-label="내 정보로">
        <UIcon name="i-lucide-chevron-left" class="size-7" />
      </NuxtLink>
      <h1 data-page-title tabindex="-1" class="text-[1.5rem] font-bold text-ink">
        예약 요청하기
      </h1>
    </div>

    <!-- 접수 완료 -->
    <div v-if="doneCode" class="card mt-4 p-6 text-center">
      <UIcon name="i-lucide-circle-check" class="mx-auto size-12 text-brand-500" />
      <h2 class="mt-3 text-[1.375rem] font-bold text-ink">
        예약 요청이 접수되었어요
      </h2>
      <p class="mt-3 text-[0.875rem] text-ink-2">
        예약번호
      </p>
      <p class="font-mono text-[1.875rem] font-extrabold tracking-wider text-brand-600">
        {{ doneCode }}
      </p>
      <p class="mt-3 text-[0.9375rem] leading-relaxed text-ink-2">
        아직 확정된 예약이 아니에요. 업체가 확인하면 남겨 주신 연락처로 확정 여부를 알려 드려요. 문의하실 때 예약번호를 알려 주세요.
      </p>
      <div class="mt-5 flex flex-col gap-2">
        <button type="button" class="btn btn-outline" @click="reset">
          다른 예약 요청하기
        </button>
        <NuxtLink to="/" class="btn btn-primary">
          홈으로
        </NuxtLink>
      </div>
    </div>

    <!-- 예약을 받는 협력업체가 아직 없을 때 -->
    <div v-else-if="!(partners ?? []).length" class="card mt-4 p-6 text-center">
      <UIcon name="i-lucide-store" class="mx-auto size-10 text-ink-2" />
      <p class="mt-2 text-[1.125rem] font-bold text-ink">
        예약을 받는 업체를 준비하고 있어요
      </p>
      <p class="mt-1 text-[0.875rem] leading-relaxed text-ink-2">
        지금은 업체 정보를 보고 직접 연락할 수 있어요.
      </p>
      <div class="mt-4 flex flex-col gap-2">
        <NuxtLink to="/businesses" class="btn btn-primary">
          업체 찾기
        </NuxtLink>
        <NuxtLink to="/advertise" class="btn btn-quiet">
          협력업체로 참여하기
        </NuxtLink>
      </div>
    </div>

    <form v-else class="mt-4 space-y-4" @submit.prevent="submit">
      <div>
        <label for="r-partner" class="text-[0.9375rem] font-bold text-ink">예약할 업체 <span class="text-brand-600">*</span></label>
        <select id="r-partner" v-model="form.partnerId" class="field mt-1.5" required>
          <option value="" disabled>
            업체를 선택하세요
          </option>
          <option v-for="p in partners" :key="p.id" :value="p.id">
            {{ p.name }} · {{ p.category }}
          </option>
        </select>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label for="r-date" class="text-[0.9375rem] font-bold text-ink">예약 날짜 <span class="text-brand-600">*</span></label>
          <input id="r-date" v-model="form.date" type="date" :min="today" class="field mt-1.5" required>
        </div>
        <div>
          <label for="r-people" class="text-[0.9375rem] font-bold text-ink">인원 <span class="text-brand-600">*</span></label>
          <input id="r-people" v-model.number="form.people" type="number" min="1" max="100" inputmode="numeric" class="field mt-1.5" required>
        </div>
      </div>

      <div>
        <label for="r-service" class="text-[0.9375rem] font-bold text-ink">원하는 서비스 (선택)</label>
        <input id="r-service" v-model="form.service" class="field mt-1.5" placeholder="예) 18홀 라운딩, 90분 마사지, 오토바이 3일">
      </div>

      <div>
        <label for="r-name" class="text-[0.9375rem] font-bold text-ink">이름 <span class="text-brand-600">*</span></label>
        <input id="r-name" v-model="form.name" autocomplete="name" class="field mt-1.5" required>
      </div>

      <div>
        <label for="r-contact" class="text-[0.9375rem] font-bold text-ink">카카오톡 ID 또는 연락처 <span class="text-brand-600">*</span></label>
        <input id="r-contact" v-model="form.contact" autocomplete="tel" class="field mt-1.5" required>
      </div>

      <div>
        <label for="r-note" class="text-[0.9375rem] font-bold text-ink">요청 사항 (선택)</label>
        <textarea id="r-note" v-model="form.note" maxlength="1000" class="field mt-1.5" placeholder="픽업 장소, 시간, 기타 요청을 적어 주세요." />
      </div>

      <!-- 스팸 방지용 숨김 필드: 사람은 채우지 않습니다. -->
      <div class="hidden" aria-hidden="true">
        <input v-model="form.website" type="text" name="website" tabindex="-1" autocomplete="off">
      </div>

      <p v-if="error" class="rounded-lg bg-red-50 p-3 text-[0.9375rem] font-bold text-red-700" role="alert">
        {{ error }}
      </p>

      <button type="submit" class="btn btn-primary w-full" :disabled="loading || !canSubmit">
        {{ loading ? '보내는 중…' : '예약 요청 보내기' }}
      </button>
      <p class="text-center text-[0.8125rem] leading-relaxed text-ink-2">
        요청을 보내는 것만으로는 예약이 확정되지 않아요. 업체의 확인을 거쳐 확정돼요.
      </p>
    </form>
  </div>
</template>
