<script setup lang="ts">
// 앱 전체의 출처는 여기 한 곳(모든 화면의 맨 아래)에만 모아서 보여 줍니다.
const credits = [
  { label: '지도 © OpenStreetMap contributors', url: 'https://www.openstreetmap.org/copyright' },
  { label: '환율 ExchangeRate-API (참고용)', url: 'https://www.exchangerate-api.com' },
  { label: '생활정보 공공데이터포털', url: 'https://www.data.go.kr' },
  { label: '축제 정보 라오스 문화관광부', url: 'https://www.tourismlaos.org' },
  { label: '3D 아이콘 Microsoft Fluent Emoji (MIT)', url: 'https://github.com/microsoft/fluentui-emoji' },
  { label: 'SNS 로고 Simple Icons (CC0)', url: 'https://simpleicons.org' }
]
</script>

<template>
  <footer class="mt-10 border-t border-default px-4 pb-2 pt-3 sm:px-5" aria-labelledby="credit-title">
    <h2 id="credit-title" class="text-[0.8125rem] font-bold text-muted">
      출처
    </h2>
    <ul class="mt-0.5 flex flex-wrap gap-x-4 text-[0.75rem] leading-relaxed text-muted">
      <li v-for="c in credits" :key="c.url">
        <a :href="c.url" target="_blank" rel="noopener" class="inline-flex min-h-11 items-center underline underline-offset-2">{{ c.label }}</a>
      </li>
    </ul>
  </footer>
</template>
