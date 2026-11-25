// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],

  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'light',
    fallback: 'light'
  },

  app: {
    head: {
      htmlAttrs: { lang: 'ko' },
      title: '라오스모아',
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
