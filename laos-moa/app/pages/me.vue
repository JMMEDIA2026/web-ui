<script setup lang="ts">
// 내 정보: 지금 실제로 제공하는 기능만 모았습니다. (회원가입·저장 기능은 아직 없습니다.)
useSeoMeta({
  title: '내 정보 · 라오스모아',
  description: '예약 요청, 협력업체 로그인, 광고·제휴 문의.'
})

const items = [
  { label: '예약 요청하기', desc: '협력업체에 예약을 요청해요', icon: 'i-lucide-calendar-check', to: '/reserve' },
  { label: '협력업체 로그인', desc: '받은 예약을 확인하는 업체용', icon: 'i-lucide-store', to: '/partner/login' },
  { label: '업체 등록·광고 문의', desc: '무료 등록과 광고 안내', icon: 'i-lucide-megaphone', to: '/advertise' }
]
</script>

<template>
  <div class="px-4 pt-5 sm:px-5">
    <h1 data-page-title tabindex="-1" class="text-[1.625rem] font-bold text-ink">
      내 정보
    </h1>
    <p class="mt-1 text-[0.9375rem] leading-relaxed text-ink-2">
      업체 검색과 연락은 로그인 없이 쓸 수 있어요.
    </p>

    <ul class="rows card mt-4 overflow-hidden">
      <li v-for="i in items" :key="i.to">
        <NuxtLink :to="i.to" class="flex min-h-[72px] items-center gap-3 px-4 py-3 active:bg-brand-100">
          <span class="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
            <UIcon :name="i.icon" class="size-6" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block text-[1rem] font-bold text-ink">{{ i.label }}</span>
            <span class="block text-[0.875rem] text-ink-2">{{ i.desc }}</span>
          </span>
          <UIcon name="i-lucide-chevron-right" class="size-5 shrink-0 text-ink-2" />
        </NuxtLink>
      </li>
    </ul>

    <section class="mt-8" aria-labelledby="credit-title">
      <h2 id="credit-title" class="text-[0.9375rem] font-bold text-ink">
        출처 안내
      </h2>
      <p class="mt-1 text-[0.8125rem] leading-relaxed text-ink-2">
        지도 © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener" class="underline">OpenStreetMap</a> contributors.
        환율 제공 <a href="https://www.exchangerate-api.com" target="_blank" rel="noopener" class="underline">ExchangeRate-API</a>(국제 기준 환율, 참고용).
        아이콘 <a href="https://lucide.dev" target="_blank" rel="noopener" class="underline">Lucide</a>.
      </p>
    </section>
  </div>
</template>
