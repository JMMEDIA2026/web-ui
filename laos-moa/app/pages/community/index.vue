<script setup lang="ts">
import type { PostListItem } from '~/data/community'
import { boards, boardMap } from '~/data/community'

useSeoMeta({
  title: '커뮤니티 · 라자',
  description: '라오스 한인 후기, 자유게시판, 질문·답변, 정보·꿀팁, 동행·모임.'
})

const route = useRoute()
const router = useRouter()
const { member } = useMember()

const board = ref(typeof route.query.board === 'string' && route.query.board in boardMap ? route.query.board : 'all')
const business = typeof route.query.business === 'string' ? route.query.business : ''

const posts = ref<PostListItem[]>([])
const total = ref(0)
const hasMore = ref(false)
const loading = ref(false)
const failed = ref(false)

interface ListRes { posts: PostListItem[], hasMore: boolean, total: number }

async function load(reset: boolean) {
  loading.value = true
  failed.value = false
  try {
    const res = await $fetch<ListRes>('/api/community/posts', {
      query: { ...(board.value !== 'all' ? { board: board.value } : {}), ...(business ? { business } : {}), offset: reset ? 0 : posts.value.length, limit: 20 }
    })
    posts.value = reset ? res.posts : [...posts.value, ...res.posts]
    hasMore.value = res.hasMore
    total.value = res.total
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
}

const first = await $fetch<ListRes>('/api/community/posts', {
  query: { ...(board.value !== 'all' ? { board: board.value } : {}), ...(business ? { business } : {}), limit: 20 }
}).catch(() => null)
if (first) { posts.value = first.posts; hasMore.value = first.hasMore; total.value = first.total } else { failed.value = true }

function pick(key: string) {
  board.value = key
  router.replace({ query: { ...(key !== 'all' ? { board: key } : {}), ...(business ? { business } : {}) } })
  load(true)
}

const writeLink = computed(() => ({
  path: '/community/write',
  query: { ...(board.value !== 'all' ? { board: board.value } : {}), ...(business ? { board: 'review', business } : {}) }
}))
const current = computed(() => (board.value === 'all' ? null : boardMap[board.value as keyof typeof boardMap]))
</script>

<template>
  <div class="px-4 pt-4">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <h1 data-page-title tabindex="-1" class="text-[1.625rem] font-extrabold text-ink">
          커뮤니티
        </h1>
        <p class="mt-0.5 text-[0.9375rem] text-ink-2">
          {{ current ? current.desc : '후기부터 질문까지, 라오스 이야기를 나눠요' }}
        </p>
      </div>
      <NuxtLink :to="writeLink" class="btn btn-primary btn-sm shrink-0">
        <span aria-hidden="true">✏️</span>글쓰기
      </NuxtLink>
    </div>

    <!-- 게시판 고르기 -->
    <div class="no-scrollbar -mx-4 mt-3 flex gap-2 overflow-x-auto px-4" role="group" aria-label="게시판 고르기">
      <button type="button" class="chip" :aria-pressed="board === 'all'" @click="pick('all')">
        전체
      </button>
      <button v-for="b in boards" :key="b.key" type="button" class="chip" :aria-pressed="board === b.key" @click="pick(b.key)">
        <span aria-hidden="true" class="me-1">{{ b.emoji }}</span>{{ b.label }}
      </button>
    </div>

    <p v-if="business" class="mt-3 rounded-2xl bg-brand-50 px-3 py-2 text-[0.875rem] font-semibold text-brand-600">
      한 업체의 후기만 보고 있어요.
      <NuxtLink to="/community?board=review" class="ms-1 underline">전체 후기 보기</NuxtLink>
    </p>

    <p class="mt-3 text-[0.8125rem] text-ink-2" aria-live="polite">
      글 {{ total }}개
    </p>

    <ul v-if="posts.length" class="divide-y divide-line">
      <li v-for="p in posts" :key="p.id">
        <PostCard :post="p" :show-board="board === 'all'" />
      </li>
    </ul>
    <div v-else-if="failed" class="mt-3 rounded-[20px] bg-fill p-5 text-center" role="alert">
      <p class="font-bold text-ink">
        글을 불러오지 못했어요
      </p>
      <button type="button" class="btn btn-primary btn-sm mt-3" @click="load(true)">
        다시 불러오기
      </button>
    </div>
    <div v-else class="mt-3 rounded-[20px] bg-fill p-6 text-center">
      <p class="text-[2rem]" aria-hidden="true">
        {{ current?.emoji ?? '💬' }}
      </p>
      <p class="mt-1 font-bold text-ink">
        아직 글이 없어요
      </p>
      <p class="mt-1 text-[0.875rem] text-ink-2">
        첫 번째 글을 남겨 보세요.
      </p>
      <NuxtLink :to="writeLink" class="btn btn-primary btn-sm mt-3">
        {{ member ? '글쓰기' : '로그인하고 글쓰기' }}
      </NuxtLink>
    </div>

    <button v-if="hasMore" type="button" class="mt-3 flex min-h-12 w-full items-center justify-center rounded-2xl border border-line text-[0.9375rem] font-bold text-ink active:bg-fill" :disabled="loading" @click="load(false)">
      {{ loading ? '불러오는 중…' : '더 보기' }}
    </button>
  </div>
</template>
