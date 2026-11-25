<script setup lang="ts">
const route = useRoute()

const isPartner = computed(() => route.path.startsWith('/partner'))
const isLogin = computed(() => route.path.endsWith('/login'))

// 검색 엔진에 노출되지 않도록 합니다.
useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const adminLinks = [
  { label: '대시보드', to: '/admin', icon: 'i-lucide-layout-dashboard', exact: true },
  { label: '예약', to: '/admin/reservations', icon: 'i-lucide-calendar-check' },
  { label: '업체', to: '/admin/businesses', icon: 'i-lucide-store' },
  { label: '협력업체', to: '/admin/partners', icon: 'i-lucide-handshake' },
  { label: '광고 문의', to: '/admin/inquiries', icon: 'i-lucide-inbox' },
  { label: '설정', to: '/admin/settings', icon: 'i-lucide-settings' }
]
const partnerLinks = [
  { label: '예약 확인', to: '/partner', icon: 'i-lucide-calendar-check', exact: true }
]

const links = computed(() => (isPartner.value ? partnerLinks : adminLinks))

function isActive(link: { to: string, exact?: boolean }) {
  return link.exact ? route.path === link.to : route.path.startsWith(link.to)
}

async function logout() {
  const kind = isPartner.value ? 'partner' : 'admin'
  await $fetch(`/api/${kind}/logout`, { method: 'POST' }).catch(() => {})
  await navigateTo(`/${kind}/login`)
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <header class="border-b border-default bg-white">
      <UContainer class="flex h-16 items-center gap-3">
        <NuxtLink :to="isPartner ? '/partner' : '/admin'" class="flex items-center gap-2 font-extrabold">
          <span class="text-[1.25rem] tracking-tight text-brand-600">라자</span>
          <UBadge :label="isPartner ? '협력업체' : '관리자'" :color="isPartner ? 'secondary' : 'primary'" variant="solid" />
        </NuxtLink>

        <nav v-if="!isLogin" class="ml-4 hidden items-center gap-1 md:flex" aria-label="관리 메뉴">
          <NuxtLink
            v-for="l in links"
            :key="l.to"
            :to="l.to"
            class="flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors"
            :class="isActive(l) ? 'bg-primary/10 text-primary' : 'text-muted hover:text-highlighted'"
          >
            <UIcon :name="l.icon" class="size-4" />
            {{ l.label }}
          </NuxtLink>
        </nav>

        <span class="flex-1" />
        <UButton to="/" label="사이트 보기" variant="ghost" color="neutral" size="sm" icon="i-lucide-external-link" />
        <UButton v-if="!isLogin" label="로그아웃" variant="outline" color="neutral" size="sm" icon="i-lucide-log-out" @click="logout" />
      </UContainer>

      <!-- 모바일 메뉴 -->
      <nav v-if="!isLogin && links.length > 1" class="flex gap-1 overflow-x-auto border-t border-default px-4 py-2 md:hidden" aria-label="관리 메뉴">
        <NuxtLink
          v-for="l in links"
          :key="l.to"
          :to="l.to"
          class="flex shrink-0 items-center gap-1.5 px-3 py-1.5 text-sm font-medium"
          :class="isActive(l) ? 'bg-primary/10 text-primary' : 'text-muted'"
        >
          <UIcon :name="l.icon" class="size-4" />
          {{ l.label }}
        </NuxtLink>
      </nav>
    </header>

    <main>
      <slot />
    </main>
  </div>
</template>
