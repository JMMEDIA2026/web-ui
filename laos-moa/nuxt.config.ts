// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],

  // 웹폰트 자동 다운로드를 끕니다. 한글 폰트가 수 MB라 Worker 용량을 초과합니다.
  ui: {
    fonts: false
  },

  css: [
    '~/assets/css/main.css',
    'leaflet/dist/leaflet.css',
    'leaflet.markercluster/dist/MarkerCluster.css'
  ],

  colorMode: {
    preference: 'light',
    fallback: 'light'
  },

  app: {
    head: {
      htmlAttrs: { lang: 'ko' },
      title: '라자',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'preconnect', href: 'https://cdn.jsdelivr.net', crossorigin: '' },
        // 영문·숫자 글꼴(Bricolage Grotesque)과 큰 숫자용 글꼴(Instrument Serif)
        { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/@fontsource-variable/bricolage-grotesque@5.3.0/index.css' },
        { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/@fontsource/instrument-serif@5.3.0/400.css' },
        { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/npm/@fontsource/instrument-serif@5.3.0/400-italic.css' },
        // 명조체(제목용)는 화면 표시를 막지 않도록 나중에 적용합니다. 글꼴이 오기 전에는 기본 명조체로 보입니다.
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css'
        }
      ],
      meta: [
        // 모바일 화면 전체(노치·하단 안전영역 포함)를 쓰고, 주소창 색을 브랜드 보라색으로 맞춥니다.
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#FAFAF9' },
        { name: 'description', content: '라오스 한인을 위한 생활 정보와 한인 업체 디렉토리, 비엔티안 한인 커뮤니티.' },
        { property: 'og:title', content: '라자' },
        { property: 'og:image', content: 'https://laja.joybox.day/og.png' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { property: 'og:description', content: '라오스 한인을 위한 생활 정보와 한인 업체 디렉토리.' }
      ]
    }
  },

  // 관리자·협력업체 화면은 서버에서 미리 그리지 않고(브라우저에서만 렌더),
  // 검색 엔진과 캐시에 남지 않도록 합니다.
  routeRules: {
    '/admin/**': { ssr: false, headers: { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' } },
    '/partner/**': { ssr: false, headers: { 'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store' } },
    '/login': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/signup': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/api/members/**': { headers: { 'Cache-Control': 'private, no-store' } },
    '/api/community/**': { headers: { 'Cache-Control': 'private, no-store' } },
    '/community/write': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/api/admin/**': { headers: { 'Cache-Control': 'no-store' } },
    '/api/v1/**': { headers: { 'Cache-Control': 'private, no-store' } },
    '/api/partner/**': { headers: { 'Cache-Control': 'no-store' } }
  },

  runtimeConfig: {
    // 환경변수 NUXT_INQUIRY_WEBHOOK_URL 로 덮어씁니다. 비어 있으면 문의는 로그에만 남습니다.
    inquiryWebhookUrl: ''
  },

  // Cloudflare Workers(정적 파일 포함)로 배포합니다.
  nitro: {
    preset: 'cloudflare_module',
    // 정적 파일을 Worker 번들 안에 포함합니다. (별도 에셋 업로드 없이 한 번에 배포)
    serveStatic: 'inline',
    // docs/ 폴더의 문서를 서버에 포함합니다. (관리자 > API 에서 API 가이드를 내려받을 때 사용)
    serverAssets: [{ baseName: 'docs', dir: './docs' }],
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
      wrangler: {
        name: 'laos-moa',
        routes: [
          { pattern: 'laja.joybox.day', custom_domain: true },
          // 이전 주소는 새 주소로 자동 이동합니다. (server/middleware/host-redirect.ts)
          { pattern: 'laos.joybox.day', custom_domain: true }
        ],
        // 예약·문의·협력업체 데이터를 저장하는 Cloudflare D1 데이터베이스
        d1_databases: [
          { binding: 'DB', database_name: 'laos-moa', database_id: 'a3f6d5fd-2a9f-4d7f-b4bf-2338df5f580f' }
        ]
      }
    }
  },

  devtools: { enabled: false },

  compatibilityDate: '2025-07-15'
})
