<script setup lang="ts">
import { guides } from '~/data/guides'

definePageMeta({ header: false })

const route = useRoute()
const router = useRouter()
const toast = useToast()

const guide = guides.find(g => g.slug === route.params.slug)

if (!guide) {
  throw createError({ statusCode: 404, statusMessage: '가이드를 찾을 수 없어요', fatal: true })
}

// 관련 업체 찾기: 가이드와 이어지는 업종이 있을 때만 보여 줍니다.
const relatedCategory: Record<string, string> = { health: 'hospital', banking: 'exchange' }
const related = relatedCategory[guide.slug]

const checked = new Date(`${guide.checkedOn}T00:00:00+07:00`).toLocaleDateString('ko-KR', { timeZone: 'Asia/Vientiane', year: 'numeric', month: 'long', day: 'numeric' })

function back() {
  if (router.options.history.state?.back) router.back()
  else navigateTo('/guides')
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.add({ title: '복사했어요', color: 'success' })
  } catch {
    toast.add({ title: '복사하지 못했어요', description: text, color: 'warning' })
  }
}

useSeoMeta({
  title: `${guide.title} · 라자`,
  description: guide.summary,
  ogImage: `https://laja.joybox.day${guide.cover}`
})
</script>

<template>
  <div class="pb-4">
    <!-- 대표 이미지 위에 뒤로가기 -->
    <div class="relative">
      <img :src="guide.cover" alt="" width="1200" height="675" class="aspect-video w-full object-cover" fetchpriority="high">
      <button type="button" class="absolute start-3 grid size-11 place-items-center rounded-md bg-default/90 text-highlighted shadow" style="top: calc(12px + env(safe-area-inset-top, 0px))" aria-label="뒤로가기" @click="back">
        <AppIcon name="back" class="size-6" />
      </button>
    </div>

    <div class="px-4 pt-5 sm:px-5">
      <p class="text-[0.875rem] font-bold text-primary">
        생활 가이드
      </p>
      <h1 data-page-title tabindex="-1" class="mt-1 text-[1.75rem] font-extrabold leading-tight text-highlighted">
        {{ guide.title }}
      </h1>
      <p class="mt-2 text-[1rem] leading-relaxed text-muted">
        {{ guide.summary }}
      </p>

      <!-- 한눈에 보기 -->
      <section class="mt-5 rounded-lg bg-primary/5 p-4" aria-labelledby="key-title">
        <h2 id="key-title" class="flex items-center gap-2 text-[1.0625rem] font-extrabold text-highlighted">
          <span aria-hidden="true">⭐</span>한눈에 보기
        </h2>
        <ul class="mt-3 space-y-2.5">
          <li v-for="k in guide.keyPoints" :key="k" class="flex items-start gap-2.5 text-[1rem] font-semibold leading-snug text-highlighted">
            <span class="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md bg-primary text-white" aria-hidden="true">
              <svg viewBox="0 0 24 24" class="size-3.5" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
            </span>
            {{ k }}
          </li>
        </ul>
      </section>

      <!-- 본문 -->
      <section v-for="(s, i) in guide.sections" :key="s.title" class="card mt-3 p-4" :aria-labelledby="`sec-${i}`">
        <h2 :id="`sec-${i}`" class="flex items-center gap-2 text-[1.125rem] font-extrabold text-highlighted">
          <span aria-hidden="true">{{ s.emoji }}</span>{{ s.title }}
        </h2>
        <ul class="mt-3 space-y-3">
          <li v-for="t in s.items" :key="t" class="flex gap-2.5 text-[1rem] leading-relaxed text-highlighted">
            <span class="mt-2.5 size-1.5 shrink-0 rounded-md bg-primary/60" aria-hidden="true" />
            <span class="min-w-0 break-words">{{ t }}</span>
          </li>
        </ul>
      </section>

      <!-- 꼭 알아 두세요 -->
      <section class="mt-3 rounded-lg bg-gold-50 p-4" aria-labelledby="warn-title">
        <h2 id="warn-title" class="flex items-center gap-2 text-[1.0625rem] font-extrabold text-gold-700">
          <span aria-hidden="true">⚠️</span>꼭 알아 두세요
        </h2>
        <p class="mt-1.5 text-[1rem] leading-relaxed text-highlighted">
          {{ guide.warning }}
        </p>
      </section>

      <!-- 연락처 -->
      <section v-if="guide.contacts?.length" class="card mt-3 overflow-hidden" aria-labelledby="contact-title">
        <h2 id="contact-title" class="flex items-center gap-2 px-4 pt-4 text-[1.125rem] font-extrabold text-highlighted">
          <span aria-hidden="true">📞</span>연락처
        </h2>
        <ul class="mt-2 divide-y divide-default">
          <li v-for="c in guide.contacts" :key="c.value" class="flex items-center gap-3 px-4 py-2">
            <span class="min-w-0 flex-1">
              <span class="block text-[0.8125rem] text-muted">{{ c.label }}</span>
              <span class="block break-all text-[1rem] font-bold text-highlighted">{{ c.value }}</span>
            </span>
            <UButton color="neutral" variant="outline" size="md" class="shrink-0" :href="c.href">{{ c.href.startsWith('mailto') ? '메일' : '전화' }}</UButton>
            <UButton color="primary" variant="soft" size="md" class="shrink-0" type="button"  @click="copy(c.value)">복사</UButton>
          </li>
        </ul>
      </section>

      <UButton color="primary" variant="solid" size="xl" block class="mt-4" v-if="related" :to="{ path: '/businesses', query: { category: related } }">
        <AppIcon name="pin" class="size-5" />
        관련 업체 찾기
      </UButton>

      <!-- 출처와 확인일 -->
      <section class="mt-6" aria-labelledby="src-title">
        <h2 id="src-title" class="text-[0.9375rem] font-extrabold text-highlighted">
          확인한 곳
        </h2>
        <ul class="mt-1 text-[0.875rem] leading-relaxed text-muted">
          <li v-for="s in guide.sources" :key="s.url">
            <a :href="s.url" target="_blank" rel="noopener" class="inline-flex min-h-11 items-center underline underline-offset-2">{{ s.label }}</a>
          </li>
        </ul>
        <p class="text-[0.8125rem] leading-relaxed text-muted">
          <span aria-hidden="true">🗓️ </span>{{ checked }}에 확인했어요. 제도와 요금은 바뀔 수 있어요.
        </p>
        <NuxtLink :to="{ path: '/advertise', query: { type: 'correction', company: `가이드: ${guide.title}` }, hash: '#inquiry' }" class="mt-1 inline-flex min-h-11 items-center text-[0.875rem] font-bold text-primary underline underline-offset-2">
          내용이 달라졌나요? 수정 요청하기
        </NuxtLink>
      </section>
    </div>
  </div>
</template>
