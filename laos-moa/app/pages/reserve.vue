<script setup lang="ts">
useSeoMeta({
  title: '예약하기 · 라오스모아',
  description: '라오스모아 협력업체(골프, 마사지, 오토바이 렌트 등)에 예약을 요청하세요.'
})

interface PartnerOption {
  id: string
  name: string
  category: string
}

const route = useRoute()
const toast = useToast()

const { data: partners } = await useFetch<PartnerOption[]>('/api/partners', { default: () => [] })

const items = computed(() => (partners.value ?? []).map(p => ({ label: `${p.name} · ${p.category}`, value: p.id })))

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
    toast.add({ title: '예약 요청을 보냈습니다', color: 'success' })
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
  <div>
    <section class="border-b border-default">
      <UContainer class="py-12 sm:py-14">
        <h1 class="section-title text-3xl font-extrabold tracking-tight text-highlighted sm:text-4xl">
          예약하기
        </h1>
        <p class="mt-2 text-muted">
          협력업체에 예약을 요청하세요. 업체가 확인한 뒤 남겨 주신 연락처로 연락드립니다.
        </p>
      </UContainer>
    </section>

    <UContainer class="py-10">
      <!-- 접수 완료 -->
      <div v-if="doneCode" class="box3d mx-auto max-w-xl border border-default bg-white p-8 text-center">
        <img src="/emoji/chat.png" alt="" class="mx-auto size-24">
        <h2 class="mt-4 text-2xl font-extrabold text-highlighted">
          예약 요청이 접수되었습니다
        </h2>
        <p class="mt-3 text-muted">
          예약번호
        </p>
        <p class="font-mono text-3xl font-extrabold tracking-wider text-primary">
          {{ doneCode }}
        </p>
        <p class="mt-4 text-sm leading-relaxed text-muted">
          아직 확정된 예약이 아닙니다. 업체가 확인하면 남겨 주신 연락처로 확정 여부를 알려 드립니다.
          문의하실 때 예약번호를 알려 주세요.
        </p>
        <div class="mt-6 flex justify-center gap-2">
          <UButton label="다른 예약하기" color="neutral" variant="outline" @click="reset" />
          <UButton to="/" label="홈으로" />
        </div>
      </div>

      <!-- 예약 가능한 업체가 없을 때 -->
      <UEmpty
        v-else-if="!items.length"
        icon="i-lucide-handshake"
        title="예약 가능한 협력업체를 준비하고 있습니다"
        description="곧 골프, 마사지, 오토바이 렌트 등을 예약하실 수 있습니다."
        :actions="[{ label: '협력업체로 참여하기', to: '/advertise#inquiry', color: 'primary' }]"
      />

      <form v-else class="box3d mx-auto grid max-w-2xl gap-5 border border-default bg-white p-6 sm:p-8" @submit.prevent="submit">
        <div>
          <label for="r-partner" class="text-sm font-bold text-highlighted">예약할 업체 <span class="text-error">*</span></label>
          <USelect id="r-partner" v-model="form.partnerId" :items="items" placeholder="업체를 선택하세요" class="mt-2 w-full" size="lg" />
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <div>
            <label for="r-date" class="text-sm font-bold text-highlighted">예약 날짜 <span class="text-error">*</span></label>
            <UInput id="r-date" v-model="form.date" type="date" :min="today" class="mt-2 w-full" size="lg" />
          </div>
          <div>
            <label for="r-people" class="text-sm font-bold text-highlighted">인원 <span class="text-error">*</span></label>
            <UInput id="r-people" v-model.number="form.people" type="number" min="1" max="100" class="mt-2 w-full" size="lg" />
          </div>
        </div>

        <div>
          <label for="r-service" class="text-sm font-bold text-highlighted">원하는 서비스 (선택)</label>
          <UInput id="r-service" v-model="form.service" placeholder="예) 18홀 라운딩, 90분 마사지, 오토바이 3일 렌트" class="mt-2 w-full" size="lg" />
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <div>
            <label for="r-name" class="text-sm font-bold text-highlighted">이름 <span class="text-error">*</span></label>
            <UInput id="r-name" v-model="form.name" autocomplete="name" class="mt-2 w-full" size="lg" />
          </div>
          <div>
            <label for="r-contact" class="text-sm font-bold text-highlighted">카카오톡 ID 또는 연락처 <span class="text-error">*</span></label>
            <UInput id="r-contact" v-model="form.contact" autocomplete="tel" class="mt-2 w-full" size="lg" />
          </div>
        </div>

        <div>
          <label for="r-note" class="text-sm font-bold text-highlighted">요청 사항 (선택)</label>
          <UTextarea id="r-note" v-model="form.note" :rows="4" maxlength="1000" placeholder="픽업 장소, 시간, 기타 요청을 적어 주세요." class="mt-2 w-full" />
        </div>

        <!-- 스팸 방지용 숨김 필드: 사람은 채우지 않습니다. -->
        <div class="hidden" aria-hidden="true">
          <input v-model="form.website" type="text" name="website" tabindex="-1" autocomplete="off">
        </div>

        <UAlert v-if="error" color="error" variant="subtle" icon="i-lucide-circle-alert" :title="error" />

        <UButton type="submit" label="예약 요청 보내기" size="xl" block :loading="loading" :disabled="!canSubmit" />
        <p class="text-center text-xs text-muted">
          요청을 보내는 것만으로는 예약이 확정되지 않습니다. 업체의 확인을 거쳐 확정됩니다.
        </p>
      </form>
    </UContainer>
  </div>
</template>
