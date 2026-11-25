// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],

  css: ['~/assets/css/main.css'],

  // 임시: 이미지 파일을 저장소에 올리기 전까지 외부 CDN으로 연결합니다.
  // GitHub 저장소에 public/ 이미지를 올린 뒤에는 이 routeRules를 지우세요.
  routeRules: {
    '/emoji/food.png': { redirect: { to: 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Fork%20and%20knife%20with%20plate/3D/fork_and_knife_with_plate_3d.png', statusCode: 301 } },
    '/emoji/mart.png': { redirect: { to: 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Shopping%20cart/3D/shopping_cart_3d.png', statusCode: 301 } },
    '/emoji/hospital.png': { redirect: { to: 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Hospital/3D/hospital_3d.png', statusCode: 301 } },
    '/emoji/school.png': { redirect: { to: 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Graduation%20cap/3D/graduation_cap_3d.png', statusCode: 301 } },
    '/emoji/house.png': { redirect: { to: 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/House/3D/house_3d.png', statusCode: 301 } },
    '/emoji/job.png': { redirect: { to: 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Briefcase/3D/briefcase_3d.png', statusCode: 301 } },
    '/emoji/sun.png': { redirect: { to: 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Sun/3D/sun_3d.png', statusCode: 301 } },
    '/emoji/money.png': { redirect: { to: 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Money%20bag/3D/money_bag_3d.png', statusCode: 301 } },
    '/emoji/visa.png': { redirect: { to: 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Passport%20control/3D/passport_control_3d.png', statusCode: 301 } },
    '/emoji/scooter.png': { redirect: { to: 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Motor%20scooter/3D/motor_scooter_3d.png', statusCode: 301 } },
    '/emoji/phone.png': { redirect: { to: 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Mobile%20phone/3D/mobile_phone_3d.png', statusCode: 301 } },
    '/emoji/embassy.png': { redirect: { to: 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Classical%20building/3D/classical_building_3d.png', statusCode: 301 } },
    '/images/sunset.jpg': { redirect: { to: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/20171118_Sunset_over_Mekong_Vientiane_3375_DxO.jpg/1280px-20171118_Sunset_over_Mekong_Vientiane_3375_DxO.jpg', statusCode: 301 } },
    '/images/thatluang.jpg': { redirect: { to: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/20171118_Pha_That_Luang_Vientiane_3184_DxO.jpg/1280px-20171118_Pha_That_Luang_Vientiane_3184_DxO.jpg', statusCode: 301 } },
    '/images/patuxai.jpg': { redirect: { to: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Vientiane-Patu_Xay-10-Allee-gje.jpg/1280px-Vientiane-Patu_Xay-10-Allee-gje.jpg', statusCode: 301 } }
  },

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

  devtools: { enabled: false },

  compatibilityDate: '2025-07-15'
})
