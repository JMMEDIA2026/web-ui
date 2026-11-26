<script setup lang="ts">
useSeoMeta({ title: '이용약관 · 라자', description: '라자 서비스 이용약관' })

const sections = [
  { title: '1. 서비스', body: '라자는 라오스 자유 여행자와 거주자를 위한 생활 정보, 환율 계산, 업체 정보 안내와 예약 요청 접수를 제공합니다.' },
  { title: '2. 회원', body: '예약 요청과 문의는 회원가입 후 이용할 수 있습니다. 회원은 본인의 실제 정보를 입력해야 하며, 타인의 정보를 사용하거나 허위로 가입할 수 없습니다.' },
  { title: '3. 예약 요청', body: '사이트에서 보낸 예약 요청은 예약 확정이 아니며, 업체의 확인을 거쳐 확정됩니다. 라자는 업체와 이용자 사이의 계약, 요금, 서비스 품질을 보증하지 않습니다.' },
  { title: '4. 정보의 정확성', body: '업체 정보, 영업시간, 환율은 참고용입니다. 환율은 국제 기준 환율로 실제 환전소의 환율과 다를 수 있습니다. 이용 전에 업체에 직접 확인해 주세요.' },
  { title: '5. 금지 행위', body: '허위 예약, 타인 사칭, 서비스 운영을 방해하는 행위, 자동화된 도구로 대량 요청을 보내는 행위를 금지합니다. 위반하면 이용이 제한될 수 있습니다.' },
  { title: '6. 탈퇴', body: '회원은 내 정보 화면에서 언제든지 탈퇴할 수 있으며, 탈퇴 시 개인정보는 개인정보 처리 안내에 따라 삭제됩니다.' }
]
</script>

<template>
  <div class="px-4 pt-5 sm:px-5">
    <h1 data-page-title tabindex="-1" class="text-[1.625rem] font-bold text-highlighted">
      이용약관
    </h1>
    <div class="mt-4 space-y-3">
      <section v-for="s in sections" :key="s.title" class="card p-4">
        <h2 class="text-[1.0625rem] font-bold text-highlighted">
          {{ s.title }}
        </h2>
        <p class="mt-1.5 text-[0.9375rem] leading-relaxed text-highlighted">
          {{ s.body }}
        </p>
      </section>
    </div>
    <NuxtLink to="/privacy" class="mt-4 inline-flex min-h-11 items-center text-[0.9375rem] font-bold text-primary underline">
      개인정보 처리 안내 보기
    </NuxtLink>
  </div>
</template>
