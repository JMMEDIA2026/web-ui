<script setup lang="ts">
// 내 정보: 지금 실제로 제공하는 기능만 모았습니다. (회원가입·저장 기능은 아직 없습니다.)
useSeoMeta({
  title: '내 정보 · 라자',
  description: '예약 요청, 협력업체 로그인, 광고·제휴 문의.'
})

const items = [
  { label: '예약 요청하기', desc: '협력업체에 예약을 요청해요', icon: 'calendar', to: '/reserve' },
  { label: '협력업체 로그인', desc: '받은 예약을 확인하는 업체용', icon: 'biz', to: '/partner/login' },
  { label: '업체 등록·광고 문의', desc: '무료 등록과 광고 안내', icon: 'megaphone', to: '/advertise' }
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
          <span class="grid size-11 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
            <AppIcon :name="i.icon" class="size-8" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="block text-[1rem] font-bold text-ink">{{ i.label }}</span>
            <span class="block text-[0.875rem] text-ink-2">{{ i.desc }}</span>
          </span>
          <AppIcon name="next" class="size-5 shrink-0 text-ink-2" />
        </NuxtLink>
      </li>
    </ul>

    <section class="mt-8" aria-labelledby="credit-title">
      <h2 id="credit-title" class="text-[0.9375rem] font-bold text-ink">
        출처 안내
      </h2>
      <ul class="mt-1 text-[0.8125rem] leading-relaxed text-ink-2">
        <li>
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener" class="inline-flex min-h-11 items-center underline">지도 © OpenStreetMap contributors</a>
        </li>
        <li>
          <a href="https://www.exchangerate-api.com" target="_blank" rel="noopener" class="inline-flex min-h-11 items-center underline">환율 제공 ExchangeRate-API (국제 기준 환율, 참고용)</a>
        </li>
        <li>
          <a href="https://github.com/microsoft/fluentui-emoji" target="_blank" rel="noopener" class="inline-flex min-h-11 items-center underline">3D 아이콘 Microsoft Fluent Emoji (MIT)</a>
        </li>
      </ul>
    </section>
  </div>
</template>
