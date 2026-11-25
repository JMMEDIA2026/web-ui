<script setup lang="ts">
// 환율 변환기. 실제 기준 환율(외부 API)로만 계산하고, 불러오지 못하면 숫자를 표시하지 않습니다.
type Cur = 'KRW' | 'LAK' | 'USD'

const props = withDefaults(defineProps<{
  initialAmount?: number
  initialFrom?: Cur
  initialTo?: Cur
}>(), { initialAmount: 10000, initialFrom: 'KRW', initialTo: 'LAK' })

interface Rates {
  updatedAt: string
  usdKrw: number
  usdLak: number
  krwLak: number
}

const { data, error, pending, refresh } = await useFetch<Rates>('/api/rates', { key: 'rates' })

const CUR: Record<Cur, { name: string, unit: string, symbol: string }> = {
  KRW: { name: '원화', unit: '원', symbol: '₩' },
  LAK: { name: '킵', unit: '킵', symbol: '₭' },
  USD: { name: '달러', unit: '달러', symbol: '$' }
}
const options = (Object.keys(CUR) as Cur[]).map(k => ({ value: k, label: `${CUR[k].name} ${CUR[k].symbol}` }))

// 자주 쓰는 방향을 한 번에 바꾸는 버튼
const presets: { from: Cur, to: Cur, label: string }[] = [
  { from: 'KRW', to: 'LAK', label: '원 → 킵' },
  { from: 'LAK', to: 'KRW', label: '킵 → 원' },
  { from: 'USD', to: 'LAK', label: '달러 → 킵' },
  { from: 'LAK', to: 'USD', label: '킵 → 달러' },
  { from: 'USD', to: 'KRW', label: '달러 → 원' },
  { from: 'KRW', to: 'USD', label: '원 → 달러' }
]

const from = ref<Cur>(props.initialFrom)
const to = ref<Cur>(props.initialTo)
const input = ref<string>(String(props.initialAmount))

const amount = computed(() => {
  const n = parseFloat(input.value.replace(/,/g, ''))
  return Number.isFinite(n) && n >= 0 ? n : 0
})

// 달러 1을 기준으로 각 통화의 값
const perUsd = computed(() => (data.value ? { USD: 1, KRW: data.value.usdKrw, LAK: data.value.usdLak } as Record<Cur, number> : null))

function convert(value: number, a: Cur, b: Cur) {
  if (!perUsd.value) return null
  return value / perUsd.value[a] * perUsd.value[b]
}

function fmt(n: number, cur: Cur) {
  const digits = cur === 'USD' && n < 1000 ? 2 : 0
  return n.toLocaleString('ko-KR', { maximumFractionDigits: digits, minimumFractionDigits: digits })
}

const result = computed(() => convert(amount.value, from.value, to.value))

// 1단위(원·킵은 1,000단위) 기준 환율 안내
const unitBase = computed(() => (from.value === 'USD' ? 1 : 1000))
const unitLine = computed(() => {
  const r = convert(unitBase.value, from.value, to.value)
  if (r === null) return ''
  return `${fmt(unitBase.value, from.value)}${CUR[from.value].unit} = ${fmt(r, to.value)}${CUR[to.value].unit}`
})

const isPreset = (p: { from: Cur, to: Cur }) => p.from === from.value && p.to === to.value

function setPair(a: Cur, b: Cur) {
  from.value = a
  to.value = b
}

function swap() {
  const a = from.value
  from.value = to.value
  to.value = a
}

// 같은 통화를 양쪽에 고르면 반대쪽을 자동으로 바꿔 줍니다.
watch(from, (v, old) => { if (v === to.value) to.value = old })
watch(to, (v, old) => { if (v === from.value) from.value = old })

function onInput(e: Event) {
  const el = e.target as HTMLInputElement
  input.value = el.value.replace(/[^\d.,]/g, '')
}

const asOf = computed(() => {
  if (!data.value) return ''
  return new Date(data.value.updatedAt).toLocaleDateString('ko-KR', {
    timeZone: 'Asia/Vientiane',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})
</script>

<template>
  <section class="rounded-lg bg-brand-500 p-4 text-white" aria-labelledby="rate-title">
    <h2 id="rate-title" class="text-[1.125rem] font-bold">
      환율 변환
    </h2>

    <!-- 불러오는 중 -->
    <div v-if="pending && !data" class="mt-3 space-y-3" aria-busy="true">
      <div class="h-[52px] animate-pulse rounded-lg bg-white/25" />
      <div class="h-[84px] animate-pulse rounded-lg bg-white/25" />
      <span class="sr-only">환율을 불러오는 중입니다.</span>
    </div>

    <!-- 불러오기 실패: 임의의 숫자를 채우지 않습니다. -->
    <div v-else-if="error || !data" class="mt-3 rounded-lg bg-surface p-4 text-ink" role="alert">
      <p class="font-bold">
        지금은 환율을 확인할 수 없어요.
      </p>
      <p class="mt-1 text-[0.875rem] leading-snug text-ink-2">
        숫자를 임의로 보여 드리지 않아요. 잠시 후 다시 시도해 주세요.
      </p>
      <button type="button" class="btn btn-primary btn-sm mt-3" @click="refresh()">
        <AppIcon name="refresh" class="size-4" />
        다시 불러오기
      </button>
    </div>

    <template v-else>
      <!-- 방향 바로 바꾸기 -->
      <div class="-mx-1 mt-3 flex flex-wrap gap-1.5" role="group" aria-label="자주 쓰는 변환">
        <button
          v-for="p in presets"
          :key="p.label"
          type="button"
          class="min-h-11 rounded-lg px-3 text-[0.9375rem] font-bold"
          :class="isPreset(p) ? 'bg-surface text-brand-600' : 'bg-brand-700 text-white active:bg-brand-800'"
          :aria-pressed="isPreset(p)"
          @click="setPair(p.from, p.to)"
        >
          {{ p.label }}
        </button>
      </div>

      <!-- 금액 입력: 입력하면 바로 계산됩니다. -->
      <div class="mt-3">
        <label for="rate-amount" class="text-[0.875rem] font-bold">{{ CUR[from].name }} 금액</label>
        <div class="mt-1.5 flex gap-2">
          <input
            id="rate-amount"
            :value="input"
            type="text"
            inputmode="decimal"
            autocomplete="off"
            class="min-h-[52px] min-w-0 flex-1 rounded-lg border-0 bg-surface px-4 text-[1.125rem] font-bold text-ink"
            @input="onInput"
          >
          <select v-model="from" aria-label="바꿀 통화" class="min-h-[52px] w-[112px] shrink-0 rounded-lg border-0 bg-surface px-3 text-[1rem] font-bold text-ink">
            <option v-for="o in options" :key="o.value" :value="o.value">
              {{ o.label }}
            </option>
          </select>
        </div>
      </div>

      <div class="my-2 flex items-center justify-center">
        <button type="button" class="grid size-11 place-items-center rounded-lg bg-brand-700 active:bg-brand-800" aria-label="통화 위치 바꾸기" @click="swap">
          <AppIcon name="swap" class="size-5" />
        </button>
      </div>

      <!-- 결과 -->
      <div class="rounded-lg bg-surface p-4 text-ink" aria-live="polite">
        <div class="flex items-center justify-between gap-2">
          <p class="text-[0.875rem] text-ink-2">
            {{ fmt(amount, from) }}{{ CUR[from].unit }} =
          </p>
          <select v-model="to" aria-label="받을 통화" class="min-h-11 rounded-lg border border-[#858C7A] bg-surface px-2 text-[0.9375rem] font-bold text-ink">
            <option v-for="o in options" :key="o.value" :value="o.value">
              {{ o.label }}
            </option>
          </select>
        </div>
        <p class="mt-0.5 break-words text-[1.75rem] font-extrabold leading-tight text-brand-600">
          약 {{ fmt(result ?? 0, to) }}<span class="ml-1 text-[1.125rem] font-bold text-ink">{{ CUR[to].unit }}</span>
        </p>
        <p class="mt-1 text-[0.8125rem] text-ink-2">
          {{ unitLine }}
        </p>
      </div>

      <p class="mt-3 text-[0.8125rem] leading-snug">
        {{ asOf }} 기준 · 출처 ExchangeRate-API
        <br>
        국제 기준 환율이며 환전소의 실제 환율과 다를 수 있어요. 환전 전에 업체에 확인하세요.
      </p>
    </template>
  </section>
</template>
