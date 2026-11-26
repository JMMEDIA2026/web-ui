<script setup lang="ts">
import { formatDateTime } from '~/data/status'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useSeoMeta({ title: '커뮤니티 · 라자 관리자' })

interface Item { id: string, body: string, author: string, hidden: boolean, report_count: number, created_at: string, title?: string, board?: string, post_id?: string }

const api = useApi('admin')
const toast = useToast()
const posts = ref<Item[]>([])
const comments = ref<Item[]>([])
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    const r = await api<{ posts: Item[], comments: Item[] }>('/community/reports')
    posts.value = r.posts
    comments.value = r.comments
  } finally {
    loading.value = false
  }
}
onMounted(load)

async function act(type: 'post' | 'comment', id: string, action: 'hide' | 'show') {
  try {
    await api('/community/moderate', { method: 'POST', body: { type, id, action } })
    await load()
  } catch (e) {
    toast.add({ title: errorMessage(e), color: 'error' })
  }
}
async function remove(type: 'post' | 'comment', id: string) {
  if (!confirm('완전히 지울까요? 되돌릴 수 없어요.')) return
  try {
    await $fetch(type === 'post' ? `/api/community/posts/${id}` : `/api/community/comments/${id}`, { method: 'DELETE' })
    await load()
  } catch (e) {
    toast.add({ title: errorMessage(e), color: 'error' })
  }
}
</script>

<template>
  <UContainer class="py-6">
    <h1 class="text-2xl font-extrabold text-highlighted">
      커뮤니티 신고
    </h1>
    <p class="mt-1 text-sm text-muted">
      신고가 3번 쌓인 글·댓글은 자동으로 숨겨져요. 확인한 뒤 숨김을 유지하거나 다시 보이게 하거나 지울 수 있어요.
    </p>
    <p v-if="loading" class="mt-6 text-muted">
      불러오는 중…
    </p>

    <template v-else>
      <h2 class="mt-6 text-lg font-bold text-highlighted">
        글 ({{ posts.length }})
      </h2>
      <p v-if="!posts.length" class="mt-2 text-sm text-muted">
        신고된 글이 없어요.
      </p>
      <ul class="mt-2 space-y-2">
        <li v-for="p in posts" :key="p.id" class="box3d border border-default bg-default p-4">
          <div class="flex flex-wrap items-center gap-2 text-xs text-muted">
            <UBadge :label="`신고 ${p.report_count}`" color="error" variant="subtle" />
            <UBadge v-if="p.hidden" label="숨김" color="neutral" variant="solid" />
            <span>{{ p.author }} · {{ formatDateTime(p.created_at) }}</span>
          </div>
          <NuxtLink :to="`/community/${p.id}`" class="mt-1 block font-bold text-highlighted underline" target="_blank">
            {{ p.title }}
          </NuxtLink>
          <p class="mt-1 line-clamp-3 whitespace-pre-wrap text-sm text-default">
            {{ p.body }}
          </p>
          <div class="mt-3 flex flex-wrap gap-2">
            <UButton v-if="!p.hidden" size="sm" color="neutral" variant="outline" label="숨기기" @click="act('post', p.id, 'hide')" />
            <UButton v-else size="sm" color="primary" variant="outline" label="다시 보이기 (신고 기록 지움)" @click="act('post', p.id, 'show')" />
            <UButton size="sm" color="error" variant="outline" label="지우기" @click="remove('post', p.id)" />
          </div>
        </li>
      </ul>

      <h2 class="mt-8 text-lg font-bold text-highlighted">
        댓글 ({{ comments.length }})
      </h2>
      <p v-if="!comments.length" class="mt-2 text-sm text-muted">
        신고된 댓글이 없어요.
      </p>
      <ul class="mt-2 space-y-2">
        <li v-for="c in comments" :key="c.id" class="box3d border border-default bg-default p-4">
          <div class="flex flex-wrap items-center gap-2 text-xs text-muted">
            <UBadge :label="`신고 ${c.report_count}`" color="error" variant="subtle" />
            <UBadge v-if="c.hidden" label="숨김" color="neutral" variant="solid" />
            <span>{{ c.author }} · {{ formatDateTime(c.created_at) }}</span>
          </div>
          <p class="mt-1 whitespace-pre-wrap text-sm text-default">
            {{ c.body }}
          </p>
          <NuxtLink :to="`/community/${c.post_id}`" class="text-xs text-muted underline" target="_blank">
            글 보기
          </NuxtLink>
          <div class="mt-3 flex flex-wrap gap-2">
            <UButton v-if="!c.hidden" size="sm" color="neutral" variant="outline" label="숨기기" @click="act('comment', c.id, 'hide')" />
            <UButton v-else size="sm" color="primary" variant="outline" label="다시 보이기 (신고 기록 지움)" @click="act('comment', c.id, 'show')" />
            <UButton size="sm" color="error" variant="outline" label="지우기" @click="remove('comment', c.id)" />
          </div>
        </li>
      </ul>
    </template>
  </UContainer>
</template>
