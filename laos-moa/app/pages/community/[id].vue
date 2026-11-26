<script setup lang="ts">
import { boardMap } from '~/data/community'
import type { Board } from '~/data/community'

definePageMeta({ header: false })

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { member } = useMember()

interface Comment { id: string, body: string, author: string, authorIsAdmin: boolean, mine: boolean, hidden: boolean, createdAt: string }
interface Detail {
  post: { id: string, board: Board['key'], title: string, body: string, author: string, authorIsAdmin: boolean, mine: boolean, businessId: string, businessName: string | null, rating: number, likeCount: number, commentCount: number, createdAt: string, hidden: boolean }
  liked: boolean
  canModerate: boolean
  comments: Comment[]
}

const { data, error, refresh } = await useFetch<Detail>(`/api/community/posts/${route.params.id}`, { key: `post-${route.params.id}` })
if (error.value || !data.value) {
  throw createError({ statusCode: 404, statusMessage: '글을 찾을 수 없어요', fatal: true })
}

const post = computed(() => data.value!.post)
const board = computed(() => boardMap[post.value.board])
const canDelete = computed(() => post.value.mine || data.value!.canModerate)

useSeoMeta({ title: `${post.value.title} · 라자 커뮤니티`, description: post.value.body.replace(/\s+/g, ' ').slice(0, 100) })

function back() {
  if (router.options.history.state?.back) router.back()
  else navigateTo('/community')
}

const busy = ref(false)
async function call<T>(fn: () => Promise<T>, ok?: string) {
  busy.value = true
  try {
    const r = await fn()
    if (ok) toast.add({ title: ok, color: 'success' })
    return r
  } catch (e) {
    toast.add({ title: errorMessage(e), color: 'error' })
    return null
  } finally {
    busy.value = false
  }
}

function needLogin(): boolean {
  if (member.value) return false
  navigateTo({ path: '/login', query: { next: route.fullPath, need: '1' } })
  return true
}

async function like() {
  if (needLogin()) return
  const r = await call(() => $fetch<{ liked: boolean, likeCount: number }>(`/api/community/posts/${post.value.id}/like`, { method: 'POST' }))
  if (r) { data.value!.liked = r.liked; data.value!.post.likeCount = r.likeCount }
}

const comment = ref('')
const website = ref('')
async function addComment() {
  if (needLogin()) return
  const text = comment.value.trim()
  if (!text) { toast.add({ title: '댓글을 입력해 주세요.', color: 'warning' }); document.getElementById('c-body')?.focus(); return }
  const r = await call(() => $fetch(`/api/community/posts/${post.value.id}/comments`, { method: 'POST', body: { body: text, website: website.value } }))
  if (r) { comment.value = ''; await refresh() }
}

async function removePost() {
  if (!confirm('이 글을 지울까요? 댓글도 함께 지워지고 되돌릴 수 없어요.')) return
  const r = await call(() => $fetch(`/api/community/posts/${post.value.id}`, { method: 'DELETE' }), '글을 지웠어요')
  if (r) await navigateTo('/community')
}
async function removeComment(id: string) {
  if (!confirm('이 댓글을 지울까요?')) return
  const r = await call(() => $fetch(`/api/community/comments/${id}`, { method: 'DELETE' }))
  if (r) await refresh()
}
async function report(type: 'post' | 'comment', id: string) {
  if (needLogin()) return
  const reason = prompt('신고하는 이유를 간단히 적어 주세요. (선택)') ?? null
  if (reason === null) return
  await call(() => $fetch('/api/community/report', { method: 'POST', body: { type, id, reason } }), '신고했어요. 운영진이 확인할게요')
}
async function moderate(type: 'post' | 'comment', id: string, action: 'hide' | 'show') {
  const r = await call(() => $fetch('/api/admin/community/moderate', { method: 'POST', body: { type, id, action } }), action === 'hide' ? '숨겼어요' : '다시 보이게 했어요')
  if (r) await refresh()
}
</script>

<template>
  <div class="pb-6">
    <header class="sticky top-0 z-30 flex items-center gap-1 border-b border-line bg-white/95 px-2 backdrop-blur" style="height: calc(56px + env(safe-area-inset-top, 0px)); padding-top: env(safe-area-inset-top, 0px)">
      <button type="button" class="grid size-11 shrink-0 place-items-center rounded-full text-ink" aria-label="뒤로가기" @click="back">
        <AppIcon name="back" class="size-6" />
      </button>
      <p class="min-w-0 flex-1 truncate text-[1.0625rem] font-bold text-ink">
        <span aria-hidden="true">{{ board.emoji }}</span> {{ board.label }}
      </p>
    </header>

    <article class="px-4 pt-4">
      <p v-if="post.hidden" class="mb-3 rounded-2xl bg-gold-50 px-3 py-2 text-[0.875rem] font-bold text-gold-700" role="status">
        이 글은 신고가 쌓이거나 운영진이 숨겨서 다른 사람에게는 보이지 않아요.
      </p>
      <div v-if="post.rating" class="text-[1.125rem] font-bold text-gold-700" :aria-label="`별점 5점 만점에 ${post.rating}점`">
        <span aria-hidden="true">{{ '★'.repeat(post.rating) }}<span class="text-line">{{ '★'.repeat(5 - post.rating) }}</span></span>
      </div>
      <h1 data-page-title tabindex="-1" class="mt-1 break-words text-[1.5rem] font-extrabold leading-snug text-ink">
        {{ post.title }}
      </h1>
      <NuxtLink v-if="post.businessName" :to="`/businesses/${post.businessId}`" class="mt-2 inline-flex min-h-11 items-center gap-1 rounded-full bg-brand-50 px-3 text-[0.875rem] font-bold text-brand-600">
        <span aria-hidden="true">📍</span>{{ post.businessName }}
      </NuxtLink>
      <p class="mt-2 text-[0.875rem] text-ink-2">
        <span class="font-semibold text-ink">{{ post.author }}</span><span v-if="post.authorIsAdmin" class="ms-1 rounded bg-brand-500 px-1 py-px text-[0.6875rem] font-bold text-white">운영진</span>
        · {{ timeAgo(post.createdAt) }}
      </p>

      <p class="mt-4 whitespace-pre-wrap break-words text-[1rem] leading-relaxed text-ink">
        {{ post.body }}
      </p>

      <div class="mt-5 flex flex-wrap items-center gap-2">
        <button type="button" class="btn btn-sm" :class="data!.liked ? 'btn-primary' : 'btn-outline'" :aria-pressed="data!.liked" :disabled="busy" @click="like">
          <span aria-hidden="true">{{ data!.liked ? '♥' : '♡' }}</span>좋아요 {{ post.likeCount }}
        </button>
        <button v-if="!post.mine" type="button" class="btn btn-quiet btn-sm" @click="report('post', post.id)">
          <span aria-hidden="true">🚩</span>신고
        </button>
        <button v-if="canDelete" type="button" class="btn btn-quiet btn-sm" :disabled="busy" @click="removePost">
          삭제
        </button>
        <button v-if="data!.canModerate" type="button" class="btn btn-quiet btn-sm" :disabled="busy" @click="moderate('post', post.id, post.hidden ? 'show' : 'hide')">
          {{ post.hidden ? '다시 보이기' : '숨기기' }}
        </button>
      </div>
    </article>

    <!-- 댓글 -->
    <section class="mt-6 border-t-8 border-fill px-4 pt-4" aria-labelledby="cm-title">
      <h2 id="cm-title" class="text-[1.125rem] font-extrabold text-ink">
        댓글 {{ data!.comments.filter(c => !c.hidden).length }}
      </h2>
      <ul v-if="data!.comments.length" class="mt-1 divide-y divide-line">
        <li v-for="c in data!.comments" :key="c.id" class="py-3" :class="c.hidden ? 'opacity-60' : ''">
          <p class="text-[0.8125rem] text-ink-2">
            <span class="font-semibold text-ink">{{ c.author }}</span><span v-if="c.authorIsAdmin" class="ms-1 rounded bg-brand-500 px-1 py-px text-[0.6875rem] font-bold text-white">운영진</span>
            · {{ timeAgo(c.createdAt) }}<span v-if="c.hidden"> · 숨김</span>
          </p>
          <p class="mt-1 whitespace-pre-wrap break-words text-[0.9375rem] leading-relaxed text-ink">
            {{ c.body }}
          </p>
          <div class="mt-1 flex gap-1">
            <button v-if="!c.mine" type="button" class="inline-flex min-h-11 items-center px-1 text-[0.8125rem] font-semibold text-ink-2 underline underline-offset-2" @click="report('comment', c.id)">
              신고
            </button>
            <button v-if="c.mine || data!.canModerate" type="button" class="inline-flex min-h-11 items-center px-1 text-[0.8125rem] font-semibold text-ink-2 underline underline-offset-2" @click="removeComment(c.id)">
              삭제
            </button>
            <button v-if="data!.canModerate" type="button" class="inline-flex min-h-11 items-center px-1 text-[0.8125rem] font-semibold text-ink-2 underline underline-offset-2" @click="moderate('comment', c.id, c.hidden ? 'show' : 'hide')">
              {{ c.hidden ? '다시 보이기' : '숨기기' }}
            </button>
          </div>
        </li>
      </ul>
      <p v-else class="mt-2 text-[0.9375rem] text-ink-2">
        아직 댓글이 없어요. 첫 댓글을 남겨 보세요.
      </p>

      <form class="mt-3" novalidate @submit.prevent="addComment">
        <label for="c-body" class="sr-only">댓글</label>
        <textarea id="c-body" v-model="comment" maxlength="500" class="field" style="min-height: 88px" :placeholder="member ? '댓글을 남겨 보세요. (500자까지)' : '로그인하면 댓글을 쓸 수 있어요.'" />
        <div class="hidden" aria-hidden="true"><input v-model="website" type="text" name="website" tabindex="-1" autocomplete="off"></div>
        <button type="submit" class="btn btn-primary mt-2 w-full" :disabled="busy">
          {{ member ? '댓글 남기기' : '로그인하고 댓글 쓰기' }}
        </button>
      </form>
    </section>
  </div>
</template>
