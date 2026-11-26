<script setup lang="ts">
import type { PostListItem } from '~/data/community'
import { boardMap } from '~/data/community'

defineProps<{ post: PostListItem, showBoard?: boolean }>()
</script>

<template>
  <NuxtLink :to="`/community/${post.id}`" class="block py-4 active:bg-fill">
    <div class="flex items-center gap-1.5 text-[0.8125rem] text-ink-2">
      <span v-if="showBoard !== false" class="rounded-full bg-fill px-2 py-0.5 font-bold text-ink">
        <span aria-hidden="true">{{ boardMap[post.board]?.emoji }}</span> {{ boardMap[post.board]?.label }}
      </span>
      <span v-if="post.rating" class="font-bold text-gold-700" :aria-label="`별점 5점 만점에 ${post.rating}점`">
        <span aria-hidden="true">{{ '★'.repeat(post.rating) }}<span class="text-line">{{ '★'.repeat(5 - post.rating) }}</span></span>
      </span>
    </div>
    <h3 class="mt-1.5 break-words text-[1.0625rem] font-bold leading-snug text-ink">
      {{ post.title }}
    </h3>
    <p v-if="post.businessName" class="mt-0.5 text-[0.8125rem] font-semibold text-brand-500">
      <span aria-hidden="true">📍</span> {{ post.businessName }}
    </p>
    <p class="mt-1 line-clamp-2 break-words text-[0.9375rem] leading-snug text-ink-2">
      {{ post.excerpt }}
    </p>
    <p class="mt-2 flex flex-wrap items-center gap-x-2 text-[0.8125rem] text-ink-2">
      <span class="font-semibold text-ink">{{ post.author }}<span v-if="post.authorIsAdmin" class="ms-1 rounded bg-brand-500 px-1 py-px text-[0.6875rem] font-bold text-white">운영진</span></span>
      <span aria-hidden="true">·</span>
      <span>{{ timeAgo(post.createdAt) }}</span>
      <span aria-hidden="true">·</span>
      <span><span aria-hidden="true">💬</span> <span class="sr-only">댓글</span>{{ post.commentCount }}</span>
      <span><span aria-hidden="true">♥</span> <span class="sr-only">좋아요</span>{{ post.likeCount }}</span>
    </p>
  </NuxtLink>
</template>
