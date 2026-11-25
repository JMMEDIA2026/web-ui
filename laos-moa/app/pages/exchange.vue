<script setup lang="ts">
useSeoMeta({
  title: '환전·환율 · 라오스모아',
  description: '오늘의 원·킵·달러 환율과 라오스 한인 환전업체 안내.'
})

const { all: allBusinesses } = await useBusinessList()
const exchangers = computed(() => allBusinesses.value.filter(b => b.category === 'exchange'))

const tips = [
  '방문 전에 환전소에 오늘의 환율을 먼저 물어보세요.',
  '여러 곳의 환율과 수수료를 비교해 보세요.',
  '받은 금액은 그 자리에서 직접 세어 확인하세요.',
  '큰 금액은 영수증이나 환전 내역을 남겨 두세요.'
]
</script>

<template>
  <div>
    <section class="border-b border-default">
      <UContainer class="py-12 sm:py-14">
        <h1 class="section-title text-3xl font-extrabold tracking-tight text-highlighted sm:text-4xl">
          환전·환율
        </h1>
        <p class="mt-2 text-muted">
          오늘의 환율을 확인하고, 가까운 한인 환전업체를 찾아보세요.
        </p>
      </UContainer>
    </section>

    <UContainer class="py-10">
      <div class="grid gap-6 lg:grid-cols-12">
        <RateWidget class="lg:col-span-5" />

        <div class="flex flex-col gap-6 lg:col-span-7">
          <div>
            <h2 class="text-xl font-extrabold text-highlighted">
              한인 환전업체
            </h2>
            <div v-if="exchangers.length" class="mt-4 grid gap-5 sm:grid-cols-2">
              <BusinessCard v-for="b in exchangers" :key="b.slug" :business="b" />
            </div>
            <UEmpty
              v-else
              class="mt-4"
              icon="i-lucide-store"
              title="환전업체를 준비하고 있습니다"
              description="곧 환전소 위치와 영업시간을 알려 드리겠습니다."
            />
          </div>

          <div class="box3d border border-default bg-white p-6">
            <h2 class="text-lg font-extrabold text-highlighted">
              환전할 때 알아 두세요
            </h2>
            <ul class="mt-3 flex flex-col gap-2 text-sm text-muted">
              <li v-for="t in tips" :key="t" class="flex items-start gap-2">
                <UIcon name="i-lucide-check" class="mt-0.5 shrink-0 text-primary" />
                {{ t }}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="mt-10">
        <AdSlot title="환전 페이지 배너 광고 자리" size="PC 728×90 · 모바일 320×100" />
      </div>
    </UContainer>
  </div>
</template>
