// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],

  // 웹폰트 자동 다운로드를 끕니다. 한글 폰트가 수 MB라 Worker 용량을 초과합니다.
  ui: {
    fonts: false
  },

  css:['~/assets/css/main.css'],

  colorMode: {
    preference: 'light',
    fallback: 'light'
  },

  app: {
    head: {
      htmlAttrs: { lang: 'ko' },
      title: '라오스모아',
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://cdn.jsdelivr.net', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css'
        }
      ],
      meta: [
        { name: 'description', content: '라오스 한인을 위한 생활 정보와 한인 업체 디렉토리, 비엔티안 한인 커뮤니티.' },
        { property: 'og:title', content: '라오스모아' },
        { property: 'og:description', content: '라오스 한인을 위한 생활 정보와 한인 업체 디렉토리.' }
      ]
    }
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
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
      wrangler: {
        name: 'laos-moa',
        routes: [{ pattern: 'laos.joybox.day', custom_domain: true }]
      }
    }
  },

  devtools: { enabled: false },

  compatibilityDate: '2025-07-15'
})
