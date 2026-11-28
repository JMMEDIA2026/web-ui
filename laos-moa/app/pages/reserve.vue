<script setup lang="ts">
import { contactProblem, decodeContactLine } from '../../shared/utils/contact'
useSeoMeta({
  title: '예약 요청 · 라자',
  description: '라자에 등록된 업체(골프, 마사지, 오토바이 렌트 등)에 예약을 요청하세요.'
})

definePageMeta({ middleware: 'member' })
const { member } = useMember()

interface PartnerOption {
  id: string
  name: string
  category: string
}

const route = useRoute()
const toast = useToast()

// 등록된 모든 업체에 예약을 요청할 수 있습니다. (협력업체와 연결되지 않은 업체는 라자가 확인해 전달)
const { real: businesses } = await useBusinessList()
const { data: partners } = await useFetch<PartnerOption[]>('/api/partners', { default: () => [] })

// 업체에 연결되지 않은 협력업체도 선택지에 남깁니다.
const linkedPartnerIds = computed(() => new Set(businesses.value.map(b => b.partnerId).filter(Boolean)))
const extraPartners = computed(() => (partners.value ?? []).filter(x => !linkedPartnerIds.value.has(x.id)))
const hasTargets = computed(() => businesses.value.length > 0 || extraPartners.value.length > 0)

function initialTarget() {
  if (typeof route.query.business === 'string') return `b:${route.query.business}`
  if (typeof route.query.partner === 'string') {
    const linked = businesses.value.find(b => b.partnerId === route.query.partner)
    return linked ? `b:${linked.slug}` : `p:${route.query.partner}`
  }
  return ''
}

// 라오스 시간(UTC+7) 기준 오늘 날짜
const today = new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10)

const form = reactive({
  target: initialTarget(),
  name: member.value?.realName ?? '',
  contact: member.value?.phone ?? '',
  date: '',
  people: 1,
  service: '',
  note: '',
  website: ''
})

const loading = ref(false)
const error = ref('')
const doneCode = ref('')
const doneDirect = ref(true)


// 빈 칸이 있어도 버튼은 눌려요. 첫 번째 문제를 안내하고 그 칸으로 커서를 옮깁니다.
function stop(selector: string, message: string) {
  error.value = message
  toast.add({ title: message, color: 'warning' })
  const el = document.querySelector<HTMLElement>(selector)
  el?.focus()
  el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
}

async function submit() {
  error.value = ''
  if (!form.target) return stop('#r-partner', '예약할 업체를 골라 주세요.')
  if (!form.date) return stop('#r-date', '예약 날짜를 골라 주세요.')
  if (form.date < today) return stop('#r-date', '오늘 이후 날짜를 골라 주세요.')
  if (!(form.people >= 1 && form.people <= 100)) return stop('#r-people', '인원은 1~100명으로 입력해 주세요.')
  if (!form.name.trim()) return stop('#r-name', '이름을 입력해 주세요.')
  const cp = contactProblem(decodeContactLine(form.contact))
  if (cp) return stop('#r-contact', cp)
  loading.value = true
  try {
    const { target, ...rest } = form
    const body = target.startsWith('b:') ? { ...rest, businessId: target.slice(2) } : { ...rest, partnerId: target.slice(2) }
    const res = await $fetch<{ code: string, direct?: boolean }>('/api/reservations', { method: 'POST', body })
    doneCode.value = res.code
    doneDirect.value = res.direct !== false
    toast.add({ title: '예약 요청을 보냈어요', color: 'success' })
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}

function reset() {
  doneCode.value = ''
  Object.assign(form, { target: initialTarget(), name: member.value?.realName ?? '', contact: member.value?.phone ?? '', date: '', people: 1, service: '', note: '', website: '' })
}
</script>

<template>
  <div class="px-4 pt-3 sm:px-5">
    <div class="flex items-center gap-1">
      <NuxtLink to="/me" class="-ml-2 grid size-11 place-items-center rounded-md text-highlighted" aria-label="내 정보로">
        <AppIcon name="back" class="size-7" />
      </NuxtLink>
      <h1 data-page-title tabindex="-1" class="text-[1.5rem] font-bold text-highlighted">
        예약 요청하기
      </h1>
    </div>

    <p v-if="member && !doneCode" class="mt-3 text-[0.9375rem] text-muted">
      <strong class="text-highlighted">{{ member.nickname }}</strong>님의 정보로 예약을 요청해요. 연락받을 방법은 전화·카카오톡·위챗·텔레그램·왓츠앱 중에서 고를 수 있어요.
    </p>

    <!-- 접수 완료 -->
    <div v-if="doneCode" class="card mt-4 p-6 text-center">
      <AppIcon name="check" class="mx-auto size-12 text-primary" />
      <h2 class="mt-3 text-[1.375rem] font-bold text-highlighted">
        예약 요청이 접수되었어요
      </h2>
      <p class="mt-3 text-[0.875rem] text-muted">
        예약번호
      </p>
      <p class="font-mono text-[1.875rem] font-extrabold tracking-wider text-primary">
        {{ doneCode }}
      </p>
      <p class="mt-3 text-[0.9375rem] leading-relaxed text-muted">
        <template v-if="doneDirect">
          아직 확정된 예약이 아니에요. 업체가 확인하면 남겨 주신 연락처로 확정 여부를 알려 드려요. 문의하실 때 예약번호를 알려 주세요.
        </template>
        <template v-else>
          아직 확정된 예약이 아니에요. 라자가 업체에 확인한 뒤 남겨 주신 연락처로 확정 여부를 알려 드려요. 문의하실 때 예약번호를 알려 주세요.
        </template>
      </p>
      <div class="mt-5 flex flex-col gap-2">
        <UButton color="neutral" variant="outline" size="xl" type="button"  @click="reset">
          다른 예약 요청하기
        </UButton>
        <UButton color="primary" variant="solid" size="xl" to="/">
          홈으로
        </UButton>
      </div>
    </div>

    <!-- 예약을 받는 협력업체가 아직 없을 때 -->
    <div v-else-if="!hasTargets" class="card mt-4 p-6 text-center">
      <AppIcon name="biz" class="mx-auto size-10 text-muted" />
      <p class="mt-2 text-[1.125rem] font-bold text-highlighted">
        예약을 받는 업체를 준비하고 있어요
      </p>
      <p class="mt-1 text-[0.875rem] leading-relaxed text-muted">
        지금은 업체 정보를 보고 직접 연락할 수 있어요.
      </p>
      <div class="mt-4 flex flex-col gap-2">
        <UButton color="primary" variant="solid" size="xl" to="/businesses">
          업체 찾기
        </UButton>
      </div>
    </div>

    <form v-else class="mt-4 space-y-4" novalidate @submit.prevent="submit">
      <div>
        <label for="r-partner" class="text-[0.9375rem] font-bold text-highlighted">예약할 업체 <span class="text-primary">*</span></label>
        <select id="r-partner" v-model="form.target" class="field mt-1.5" required>
          <option value="" disabled>
            업체를 선택하세요
          </option>
          <option v-for="b in businesses" :key="b.slug" :value="`b:${b.slug}`">
            {{ b.name }}
          </option>
          <option v-for="x in extraPartners" :key="x.id" :value="`p:${x.id}`">
            {{ x.name }} · {{ x.category }}
          </option>
        </select>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label for="r-date" class="text-[0.9375rem] font-bold text-highlighted">예약 날짜 <span class="text-primary">*</span></label>
          <UInput id="r-date" v-model="form.date" type="date" :min="today" required size="xl" class="mt-1.5 w-full" />
        </div>
        <div>
          <label for="r-people" class="text-[0.9375rem] font-bold text-highlighted">인원 <span class="text-primary">*</span></label>
          <UInput id="r-people" v-model.number="form.people" type="number" min="1" max="100" inputmode="numeric" required size="xl" class="mt-1.5 w-full" />
        </div>
      </div>

      <div>
        <label for="r-service" class="text-[0.9375rem] font-bold text-highlighted">원하는 서비스 (선택)</label>
        <UInput id="r-service" v-model="form.service" placeholder="예) 18홀 라운딩, 90분 마사지, 오토바이 3일" size="xl" class="mt-1.5 w-full" />
      </div>

      <div>
        <label for="r-name" class="text-[0.9375rem] font-bold text-highlighted">이름 <span class="text-primary">*</span></label>
        <UInput id="r-name" v-model="form.name" autocomplete="name" required size="xl" class="mt-1.5 w-full" />
      </div>

      <div>
        <ContactInput id="r-contact" v-model="form.contact" label="연락받을 방법" required />
      </div>

      <div>
        <label for="r-note" class="text-[0.9375rem] font-bold text-highlighted">요청 사항 (선택)</label>
        <UTextarea id="r-note" v-model="form.note" maxlength="1000" placeholder="픽업 장소, 시간, 기타 요청을 적어 주세요." size="xl" class="mt-1.5 w-full" :rows="4" />
      </div>

      <!-- 스팸 방지용 숨김 필드: 사람은 채우지 않습니다. -->
      <div class="hidden" aria-hidden="true">
        <input v-model="form.website" type="text" name="website" tabindex="-1" autocomplete="off">
      </div>

      <p v-if="error" class="rounded-lg bg-red-50 p-3 text-[0.9375rem] font-bold text-red-700" role="alert">
        {{ error }}
      </p>

      <UButton color="primary" variant="solid" size="xl" block type="submit"  :disabled="loading">
        {{ loading ? '보내는 중…' : '예약 요청 보내기' }}
      </UButton>
      <p class="text-center text-[0.8125rem] leading-relaxed text-muted">
        요청을 보내는 것만으로는 예약이 확정되지 않아요. 업체 확인을 거쳐 확정돼요. 협력업체가 아닌 곳은 라자가 업체에 확인해 연락드려요.
      </p>
    </form>
  </div>
</template>
