<script setup lang="ts">
useSeoMeta({ title: '개인정보 처리 안내 · 라자', description: '라자가 수집하는 개인정보와 이용 목적, 보관 기간 안내' })

const rows = [
  { k: '수집 항목', v: '이메일, 비밀번호(암호화하여 저장), 닉네임, 실명, 휴대폰 번호, 성별' },
  { k: '이용 목적', v: '회원 확인, 예약·문의 접수와 연락, 부정 이용 방지' },
  { k: '제3자 제공', v: '예약을 요청한 업체에 예약 처리를 위해 이름과 연락처를 전달합니다. 그 밖의 제3자에게는 제공하지 않습니다.' },
  { k: '보관 기간', v: '회원 정보는 탈퇴할 때까지 보관하고, 탈퇴하면 삭제합니다. 예약·문의 처리 기록은 분쟁 대응을 위해 처리일로부터 1년간 보관한 뒤 삭제하며, 이 기록은 탈퇴 후 회원과의 연결이 끊깁니다.' },
  { k: '동의 거부', v: '동의하지 않을 수 있습니다. 다만 동의하지 않으면 회원가입과 예약·문의 기능을 이용할 수 없습니다. 업체 검색, 환율, 가이드는 가입 없이 이용할 수 있습니다.' },
  { k: '이용자의 권리', v: '내 정보 화면에서 회원 정보를 확인하고 탈퇴(삭제)할 수 있습니다. 정정·삭제 요청은 업체 등록·광고 문의 화면의 문의로도 접수할 수 있습니다.' }
]
</script>

<template>
  <div class="px-4 pt-5 sm:px-5">
    <h1 data-page-title tabindex="-1" class="text-[1.625rem] font-bold text-ink">
      개인정보 처리 안내
    </h1>
    <dl class="card mt-4 divide-y divide-line overflow-hidden">
      <div v-for="r in rows" :key="r.k" class="p-4">
        <dt class="text-[0.875rem] font-bold text-brand-600">
          {{ r.k }}
        </dt>
        <dd class="mt-1 text-[0.9375rem] leading-relaxed text-ink">
          {{ r.v }}
        </dd>
      </div>
    </dl>
    <NuxtLink to="/terms" class="mt-4 inline-flex min-h-11 items-center text-[0.9375rem] font-bold text-brand-600 underline">
      이용약관 보기
    </NuxtLink>
  </div>
</template>
