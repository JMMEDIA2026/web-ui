<script setup lang="ts">
import { contactProblem, decodeContactLine } from '../../shared/utils/contact'
definePageMeta({ middleware: 'member' })
const { member } = useMember()

useSeoMeta({
  title: '업체 등록·광고 문의 · 라자',
  description: '한인 업체 무료 등록, 추천 업체, 배너 광고 안내와 문의.'
})

const toast = useToast()

const tiers = [
  { title: '무료 등록', items: ['업체 기본 정보 등록', '지도·연락처 표시'], price: '무료' },
  { title: '추천 업체', items: ['목록 상단 노출(“광고” 표시)', '사진과 소개 보강'], price: '가격은 문의 후 안내해 드려요.' },
  { title: '예약 연결', items: ['사이트에서 들어온 예약 요청 확인', '업체 전용 예약 확인 화면'], price: '조건은 협의 후 정해요.' }
]

const productOptions = [
  { label: '무료 업체 등록', value: 'free' },
  { label: '추천 업체(광고)', value: 'premium' },
  { label: '배너 광고', value: 'banner' },
  { label: '정보 수정 제안', value: 'correction' },
  { label: '제휴·기타', value: 'etc' }
]

// 업체 상세의 "정보 수정 요청하기"로 들어오면 문의 종류와 업체명을 미리 채웁니다.
const route = useRoute()
const presetType = productOptions.some(o => o.value === route.query.type) ? String(route.query.type) : ''
const presetCompany = typeof route.query.company === 'string' ? route.query.company.slice(0, 100) : ''
const form = reactive({ company: presetCompany, contact: member.value?.phone ?? '', product: presetType, message: '', website: '' })
// 회원 정보가 늦게 도착해도 연락처 칸을 미리 채웁니다.
watch(() => member.value?.phone, (v) => { if (v && !form.contact) form.contact = v }, { immediate: true })
const loading = ref(false)
const error = ref('')
const done = ref(false)


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
  if (!form.company.trim()) return stop('#i-company', '업체명을 입력해 주세요.')
  const cp = contactProblem(decodeContactLine(form.contact))
  if (cp) return stop('#i-contact', cp)
  if (!form.product) return stop('#i-product', '문의 종류를 골라 주세요.')
  loading.value = true
  try {
    await $fetch('/api/inquiry', { method: 'POST', body: { ...form } })
    done.value = true
    toast.add({ title: '문의가 접수되었어요', color: 'success' })
    Object.assign(form, { company: '', contact: member.value?.phone ?? '', product: '', message: '', website: '' })
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="px-4 pt-3 sm:px-5">
    <div class="flex items-center gap-1">
      <NuxtLink to="/me" class="-ml-2 grid size-11 place-items-center rounded-full text-ink" aria-label="내 정보로">
        <AppIcon name="back" class="size-7" />
      </NuxtLink>
      <h1 data-page-title tabindex="-1" class="text-[1.5rem] font-bold text-ink">
        업체 등록·광고 문의
      </h1>
    </div>
    <p class="mt-2 text-[0.9375rem] leading-relaxed text-ink-2">
      라오스에서 사업장을 운영하신다면 무료로 등록해 보세요. 광고는 항상 “광고”로 표시해서 일반 정보와 구분해요.
    </p>

    <ul class="mt-4 space-y-3">
      <li v-for="t in tiers" :key="t.title" class="card p-4">
        <h2 class="text-[1.125rem] font-bold text-ink">
          {{ t.title }}
        </h2>
        <ul class="mt-2 space-y-1.5">
          <li v-for="i in t.items" :key="i" class="flex items-start gap-2 text-[0.9375rem] text-ink">
            <AppIcon name="check" class="mt-0.5 size-5 shrink-0 text-brand-500" />
            {{ i }}
          </li>
        </ul>
        <p class="mt-3 text-[0.875rem] font-semibold text-brand-600">
          {{ t.price }}
        </p>
      </li>
    </ul>

    <section id="inquiry" class="card mt-6 scroll-mt-4 p-4" aria-labelledby="inq-title">
      <h2 id="inq-title" class="text-[1.25rem] font-bold text-ink">
        문의 남기기
      </h2>
      <p class="mt-1 text-[0.875rem] text-ink-2">
        업체 정보가 달라졌다면 문의 종류에서 “정보 수정 제안”을 골라 주세요.
      </p>

      <div v-if="done" class="mt-4 rounded-lg bg-brand-100 p-4 text-[0.9375rem] leading-relaxed text-brand-600" role="status">
        문의가 접수되었어요. 확인 후 남겨 주신 연락처로 연락드릴게요.
        <button type="button" class="mt-3 block min-h-11 font-bold underline" @click="done = false">
          다른 문의 남기기
        </button>
      </div>

      <form v-else class="mt-4 space-y-4" novalidate @submit.prevent="submit">
        <div>
          <label for="i-company" class="text-[0.9375rem] font-bold text-ink">업체명 <span class="text-brand-600">*</span></label>
          <input id="i-company" v-model="form.company" class="field mt-1.5" required>
        </div>
        <div>
          <ContactInput id="i-contact" v-model="form.contact" label="연락받을 방법" required />
        </div>
        <div>
          <label for="i-product" class="text-[0.9375rem] font-bold text-ink">문의 종류 <span class="text-brand-600">*</span></label>
          <select id="i-product" v-model="form.product" class="field mt-1.5" required>
            <option value="" disabled>
              선택하세요
            </option>
            <option v-for="o in productOptions" :key="o.value" :value="o.value">
              {{ o.label }}
            </option>
          </select>
        </div>
        <div>
          <label for="i-message" class="text-[0.9375rem] font-bold text-ink">문의 내용 (선택)</label>
          <textarea id="i-message" v-model="form.message" maxlength="2000" class="field mt-1.5" placeholder="업체 소개나 원하시는 내용을 적어 주세요. (정보 수정은 바뀐 내용을 적어 주세요)" />
        </div>

        <div class="hidden" aria-hidden="true">
          <input v-model="form.website" type="text" name="website" tabindex="-1" autocomplete="off">
        </div>

        <p v-if="error" class="rounded-lg bg-red-50 p-3 text-[0.9375rem] font-bold text-red-700" role="alert">
          {{ error }}
        </p>

        <button type="submit" class="btn btn-primary w-full" :disabled="loading">
          {{ loading ? '보내는 중…' : '문의 보내기' }}
        </button>
      </form>
    </section>
  </div>
</template>
