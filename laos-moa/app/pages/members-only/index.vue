<script setup lang="ts">
import type { Business } from '~/data/businesses'

// 회원전용: 로그인한 회원만 볼 수 있는 업체 목록. 비회원에게는 안내만 보여 줍니다.
definePageMeta({ header: false })
useSeoMeta({ robots: 'noindex', title: '회원전용 · 라자', description: '회원만 볼 수 있는 업체 모음입니다.' })

const route = useRoute()
const request = useRequestFetch()
const { loggedIn, pending: memberPending } = useMember()

const { data: list, pending, error, refresh } = await useAsyncData<Business[]>(
  'members-only-list',
  () => request<Business[]>('/api/members-only/businesses'),
  { default: () => [] }
)

// 로그인 상태가 바뀌면(로그인·로그아웃) 다시 불러옵니다.
watch(loggedIn, () => refresh())

const needLogin = computed(() => (error.value as { statusCode?: number } | null)?.statusCode === 401 || (!loggedIn.value && !memberPending.value))
const loginTo = computed(() => ({ path: '/login', query: { next: route.fullPath, need: '1' } }))
const signupTo = computed(() => ({ path: '/signup', query: { next: route.fullPath } }))
</script>

<template>
  <div class="px-4 pt-5 sm:px-5">
    <p class="flex items-center gap-1.5 text-[0.875rem] font-bold text-primary">
      <UIcon name="i-lucide-lock-keyhole" class="size-4" aria-hidden="true" />
      회원전용
    </p>
    <h1 data-page-title tabindex="-1" class="mt-1 text-[1.75rem] font-extrabold leading-tight text-highlighted">
      회원만 볼 수 있어요
    </h1>
    <p class="mt-2 text-[1rem] leading-relaxed text-muted">
      가입하고 로그인한 회원에게만 보이는 업체 모음이에요.
    </p>

    <!-- 비회원 안내 -->
    <section v-if="needLogin" class="card mt-5 p-5 text-center" aria-labelledby="gate-title">
      <img src="/emoji/members.png" alt="" width="64" height="64" class="mx-auto size-16">
      <h2 id="gate-title" class="mt-2 text-[1.125rem] font-extrabold text-highlighted">
        로그인하면 볼 수 있어요
      </h2>
      <p class="mt-1 text-[0.9375rem] leading-relaxed text-muted">
        아직 회원이 아니라면 1분이면 가입할 수 있어요.
      </p>
      <div class="mt-4 grid gap-2">
        <UButton :to="loginTo" color="primary" size="xl" block>로그인</UButton>
        <UButton :to="signupTo" color="neutral" variant="outline" size="xl" block>회원가입</UButton>
      </div>
    </section>

    <!-- 회원 목록 -->
    <template v-else>
      <p v-if="pending" class="mt-5 text-[0.9375rem] text-muted">불러오는 중이에요…</p>
      <ul v-else-if="list.length" class="mt-4 divide-y divide-default overflow-hidden rounded-lg border border-default bg-default">
        <BusinessRow v-for="b in list" :key="b.slug" :business="b" :selected="false" />
      </ul>
      <section v-else class="card mt-5 p-5 text-center">
        <p class="text-[1rem] font-bold text-highlighted">아직 등록된 업체가 없어요</p>
        <p class="mt-1 text-[0.9375rem] text-muted">업체가 등록되면 이곳에 보여 드릴게요.</p>
      </section>
    </template>

    <p class="mt-6 text-[0.8125rem] text-muted">
      이 화면의 업체 정보와 사진은 검색 결과나 외부에 공개되지 않아요.
    </p>
  </div>
</template>
