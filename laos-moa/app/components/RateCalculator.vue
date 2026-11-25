<script setup lang="ts">
// 환율 계산기. 실제 기준 환율(외부 API)로만 계산하고, 불러오지 못하면 숫자를 표시하지 않습니다.
const props = withDefaults(defineProps<{
  initialAmount?: number
  /** 홈에서는 "환율 상세" 링크를 보여 줍니다. */
  showDetailLink?: boolean
}>(), { initialAmount: 10000, showDetailLink: false })

interface Rates {
  updatedAt: string
  usdKrw: number
  usdLak: number
  krwLak: number
}

const { data, error, pending, refresh } = await useFetch<Rates>('/api/rates', { key: 'rates' })

const input = ref<string>(String(props.initialAmount))
const applied = ref<number>(props.initialAmount)
const live = ref('')

const fmt = (n: number) => n.toLocaleString('ko-KR', { maximumFractionDigits: 0 })

const inputNumber = computed(() => Number(input.value.replace(/[^\d]/g, '')) || 0)
const dirty = computed(() => inputNumber.value !== applied.value)
const kip = computed(() => (data.value ? Math.round(applied.value * data.value.krwLak) : null))

const asOf = computed(() => {
  if (!data.value) return ''
  return new Date(data.value.updatedAt).toLocaleDateString('ko-KR', {
    timeZone: 'Asia/Vientiane',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})

function calculate() {
  applied.value = inputNumber.value
  input.value = String(inputNumber.value)
  if (data.value) live.value = `${fmt(applied.value)}원은 약 ${fmt(Math.round(applied.value * data.value.krwLak))}킵입니다.`
}

const detailLink = computed(() => `/exchange?amount=${applied.value}`)
</script>

<template>
  <section class="rounded-2xl bg-brand-500 p-5 text-white" aria-labelledby="rate-title">
    <div class="flex items-center justify-between gap-3">
      <h2 id="rate-title" class="text-[1.25rem] font-bold">
        환율 계산기
      </h2>
      <NuxtLink v-if="showDetailLink" :to="detailLink" class="inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-[0.875rem] font-bold underline-offset-2 hover:underline">
        환율 상세
        <UIcon name="i-lucide-chevron-right" class="size-4" />
      </NuxtLink>
    </div>

    <!-- 불러오는 중 -->
    <div v-if="pending && !data" class="mt-4 space-y-3" aria-busy="true">
      <div class="h-[52px] animate-pulse rounded-xl bg-white/25" />
      <div class="h-[84px] animate-pulse rounded-xl bg-white/25" />
      <span class="sr-only">환율을 불러오는 중입니다.</span>
    </div>

    <!-- 불러오기 실패: 임의의 숫자를 채우지 않습니다. -->
    <div v-else-if="error || !data" class="mt-4 rounded-xl bg-white p-4 text-ink" role="alert">
      <p class="font-bold">
        지금은 환율을 확인할 수 없어요.
      </p>
      <p class="mt-1 text-[0.875rem] leading-snug text-ink-2">
        숫자를 임의로 보여 드리지 않아요. 잠시 후 다시 시도해 주세요.
      </p>
      <button type="button" class="btn btn-primary btn-sm mt-3" @click="refresh()">
        <UIcon name="i-lucide-refresh-cw" class="size-4" />
        다시 불러오기
      </button>
    </div>

    <template v-else>
      <form class="mt-4" @submit.prevent="calculate">
        <label for="rate-amount" class="text-[0.875rem] font-bold">원화 금액 (원)</label>
        <div class="mt-1.5 flex gap-2">
          <input
            id="rate-amount"
            v-model="input"
            type="text"
            inputmode="numeric"
            autocomplete="off"
            class="min-h-[52px] min-w-0 flex-1 rounded-xl border-0 bg-white px-4 text-[1.125rem] font-bold text-ink"
          >
          <button type="submit" class="btn shrink-0 bg-white text-brand-600 active:bg-brand-100">
            계산하기
          </button>
        </div>
        <p v-if="dirty" class="mt-1.5 text-[0.8125rem] font-bold">
          금액을 바꿨어요. 계산하기를 눌러 주세요.
        </p>
      </form>

      <div class="mt-4 rounded-xl bg-white p-4 text-ink" aria-live="polite">
        <p class="text-[0.875rem] text-ink-2">
          {{ fmt(applied) }}원은
        </p>
        <p class="mt-0.5 break-words text-[1.75rem] font-extrabold leading-tight text-brand-600">
          약 {{ fmt(kip ?? 0) }}<span class="ml-1 text-[1.125rem] font-bold text-ink">킵</span>
        </p>
      </div>
      <p class="sr-only" role="status">{{ live }}</p>

      <p class="mt-3 text-[0.8125rem] leading-snug">
        {{ asOf }} 기준 · 출처 ExchangeRate-API
        <br>
        국제 기준 환율이며 환전소의 실제 환율과 다를 수 있어요. 환전 전에 업체에 확인하세요.
      </p>
    </template>
  </section>
</template>
