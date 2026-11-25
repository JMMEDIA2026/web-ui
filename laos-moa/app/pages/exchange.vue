<script setup lang="ts">
useSeoMeta({
  title: '환율 · 라자',
  description: '원·킵·달러 기준 환율과 환율 계산기, 환전업체 안내.'
})

const route = useRoute()
// 홈 계산기에서 입력한 금액을 그대로 이어받습니다.
const amount = Number(route.query.amount) > 0 ? Math.round(Number(route.query.amount)) : 10000
const curs = ['KRW', 'LAK', 'USD'] as const
type Cur = typeof curs[number]
const pick = (v: unknown, d: Cur): Cur => (curs.includes(v as Cur) ? (v as Cur) : d)
const from = pick(route.query.from, 'KRW')
const to = pick(route.query.to, 'LAK')

const { real } = await useBusinessList()
const exchangers = computed(() => real.value.filter(b => b.category === 'exchange'))

interface Rates { updatedAt: string, usdKrw: number, usdLak: number, krwLak: number }
const { data: rates } = await useFetch<Rates>('/api/rates', { key: 'rates' })
const fmt = (n: number) => n.toLocaleString('ko-KR', { maximumFractionDigits: 0 })
</script>

<template>
  <div class="px-4 pt-3 sm:px-5">
    <div class="flex items-center gap-1">
      <NuxtLink to="/" class="-ml-2 grid size-11 place-items-center rounded-full text-ink" aria-label="홈으로">
        <AppIcon name="back" class="size-7" />
      </NuxtLink>
      <h1 data-page-title tabindex="-1" class="text-[1.5rem] font-bold text-ink">
        환율
      </h1>
    </div>

    <div class="mt-3">
      <RateCalculator :initial-amount="amount" :initial-from="from" :initial-to="to === from ? 'LAK' : to" />
    </div>

    <section class="mt-5" aria-labelledby="ex-title">
      <h2 id="ex-title" class="text-[1.25rem] font-bold text-ink">
        환전업체
      </h2>
      <ul v-if="exchangers.length" class="rows card mt-2 overflow-hidden">
        <li v-for="b in exchangers" :key="b.slug">
          <NuxtLink :to="`/businesses/${b.slug}`" class="flex min-h-[68px] items-center gap-3 px-4 py-3 active:bg-brand-100">
            <span class="grid size-11 shrink-0 place-items-center rounded-lg bg-brand-50">
              <img src="/emoji/exchange.png" alt="" width="32" height="32" class="size-8 object-contain" loading="lazy">
            </span>
            <span class="min-w-0 flex-1">
              <span class="block font-bold text-ink">{{ b.name }}</span>
              <span class="block truncate text-[0.875rem] text-ink-2">{{ b.address || b.area }}</span>
            </span>
            <AppIcon name="next" class="size-5 shrink-0 text-ink-2" />
          </NuxtLink>
        </li>
      </ul>
      <div v-else class="card mt-2 p-5 text-center">
        <p class="font-bold text-ink">
          아직 등록된 환전업체가 없어요
        </p>
        <p class="mt-1 text-[0.875rem] text-ink-2">
          환전업체가 등록되면 여기에서 위치와 연락처를 확인할 수 있어요.
        </p>
        <NuxtLink :to="{ path: '/businesses', query: { category: 'exchange' } }" class="btn btn-quiet mt-3">
          지도에서 환전 찾기
        </NuxtLink>
      </div>
    </section>

    <!-- 기준 환율은 불러온 경우에만 표시합니다. -->
    <section v-if="rates" class="card mt-5 p-4" aria-labelledby="ref-title">
      <h2 id="ref-title" class="text-[1.125rem] font-bold text-ink">
        기준 환율
      </h2>
      <dl class="rows mt-2">
        <div class="flex items-baseline justify-between gap-3 py-3">
          <dt class="text-[0.9375rem] text-ink-2">
            1,000원
          </dt>
          <dd class="text-[1.25rem] font-bold tabular-nums text-ink">
            ₭ {{ fmt(1000 * rates.krwLak) }}
          </dd>
        </div>
        <div class="flex items-baseline justify-between gap-3 py-3">
          <dt class="text-[0.9375rem] text-ink-2">
            1달러
          </dt>
          <dd class="text-[1.25rem] font-bold tabular-nums text-ink">
            ₭ {{ fmt(rates.usdLak) }}
          </dd>
        </div>
        <div class="flex items-baseline justify-between gap-3 py-3">
          <dt class="text-[0.9375rem] text-ink-2">
            1달러
          </dt>
          <dd class="text-[1.25rem] font-bold tabular-nums text-ink">
            ₩ {{ fmt(rates.usdKrw) }}
          </dd>
        </div>
      </dl>
    </section>
  </div>
</template>
