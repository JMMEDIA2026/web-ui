<template>
  <!-- 라오스 국기(빨강-파랑-빨강)에 금색 해를 얹은 로고 마크 -->
  <svg viewBox="0 0 48 48" aria-hidden="true" class="shrink-0 overflow-hidden rounded-sm">
    <defs>
      <radialGradient id="laos-moa-sun" cx="38%" cy="32%" r="75%">
        <stop offset="0" stop-color="#FFE98A" />
        <stop offset="0.55" stop-color="#FFB81C" />
        <stop offset="1" stop-color="#F08A00" />
      </radialGradient>
    </defs>
    <rect width="48" height="48" fill="#0B3A8C" />
    <rect width="48" height="12" fill="#D6192F" />
    <rect y="36" width="48" height="12" fill="#D6192F" />
    <circle cx="24" cy="25" r="11.5" fill="#000" opacity="0.12" />
    <circle cx="24" cy="24" r="11.5" fill="url(#laos-moa-sun)" />
    <ellipse cx="20.5" cy="19.5" rx="4.2" ry="2.6" fill="#fff" opacity="0.5" transform="rotate(-25 20.5 19.5)" />
  </svg>
</template>
