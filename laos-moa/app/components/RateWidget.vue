<script setup lang="ts">
interface Rates {
  updatedAt: string
  usdKrw: number
  usdLak: number
  krwLak: number
}

const { data, error } = await useFetch<Rates>('/api/rates', { key: 'rates' })

const won = ref<number | undefined>(10000)

const fmt = (n: number, digits = 0) => n.toLocaleString('ko-KR', { maximumFractionDigits: digits })

const kip = computed(() => (data.value ? Math.round((Number(won.value) || 0) * data.value.krwLak) : 0))

const updated = computed(() => {
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
  <section class="box3d flex flex-col gap-5 rounded-lg border border-default bg-white p-6 sm:p-7" aria-label="오늘의 환율">
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-center gap-3">
        <span class="flex size-12 items-center justify-center bg-tone-sun"><img src="/emoji/exchange.png" alt="" class="size-9"></span>
        <div>
          <h2 class="text-lg font-extrabold text-highlighted">
            오늘의 환율
          </h2>
          <p v-if="updated" class="text-xs text-muted">
            {{ updated }} 기준
          </p>
        </div>
      </div>
      <UBadge label="참고용" color="neutral" variant="subtle" />
    </div>

    <UAlert
      v-if="error || !data"
      color="warning"
      variant="subtle"
      icon="i-lucide-triangle-alert"
      title="환율을 불러오지 못했습니다"
      description="잠시 후 다시 시도해 주세요."
    />

    <template v-else>
      <dl class="divide-y divide-default border-y border-default">
        <div class="flex items-baseline justify-between gap-4 py-3">
          <dt class="text-sm text-muted">
            1,000원
          </dt>
          <dd class="text-xl font-extrabold tabular-nums text-highlighted">
            ₭ {{ fmt(1000 * data.krwLak) }}
          </dd>
        </div>
        <div class="flex items-baseline justify-between gap-4 py-3">
          <dt class="text-sm text-muted">
            1달러
          </dt>
          <dd class="text-xl font-extrabold tabular-nums text-highlighted">
            ₭ {{ fmt(data.usdLak) }}
          </dd>
        </div>
        <div class="flex items-baseline justify-between gap-4 py-3">
          <dt class="text-sm text-muted">
            1달러
          </dt>
          <dd class="text-xl font-extrabold tabular-nums text-highlighted">
            ₩ {{ fmt(data.usdKrw) }}
          </dd>
        </div>
      </dl>

      <div>
        <label for="rate-won" class="text-sm font-bold text-highlighted">원화를 킵으로 계산</label>
        <div class="mt-2 grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
          <UInput id="rate-won" v-model.number="won" type="number" min="0" inputmode="numeric" size="lg" placeholder="금액(원)" class="w-full" />
          <UIcon name="i-lucide-arrow-right" class="hidden size-5 text-muted sm:block" />
          <p class="bg-tone-sun px-4 py-2 text-right text-lg font-extrabold tabular-nums text-highlighted">
            ₭ {{ fmt(kip) }}
          </p>
        </div>
      </div>
    </template>

    <p class="text-xs leading-relaxed text-muted">
      국제 기준 환율이며 실제 환전소 환율과 다를 수 있습니다. 환전 전에 업체에 직접 확인하세요.
      환율 제공:
      <ULink to="https://www.exchangerate-api.com" target="_blank" class="underline">ExchangeRate-API</ULink>
    </p>
  </section>
</template>
