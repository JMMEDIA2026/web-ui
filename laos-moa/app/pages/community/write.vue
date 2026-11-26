<script setup lang="ts">
import { boards, boardMap } from '~/data/community'

definePageMeta({ middleware: 'member', header: false })
useSeoMeta({ title: '글쓰기 · 라자 커뮤니티', robots: 'noindex' })

const route = useRoute()
const router = useRouter()
const toast = useToast()

const startBoard = typeof route.query.board === 'string' && route.query.board in boardMap ? route.query.board : 'free'
const form = reactive({
  board: startBoard as string,
  businessId: typeof route.query.business === 'string' ? route.query.business : '',
  rating: 0,
  title: '',
  body: '',
  website: ''
})

const { real } = await useBusinessList()
const current = computed(() => boardMap[form.board as keyof typeof boardMap])

const loading = ref(false)
const error = ref('')

function stop(selector: string, message: string) {
  error.value = message
  toast.add({ title: message, color: 'warning' })
  const el = document.querySelector<HTMLElement>(selector)
  el?.focus()
  el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
}

function back() {
  if (router.options.history.state?.back) router.back()
  else navigateTo('/community')
}

async function submit() {
  error.value = ''
  if (form.board === 'review' && !form.rating) return stop('#w-rating button', '별점을 골라 주세요.')
  if (form.title.trim().length < 2) return stop('#w-title', '제목을 2자 이상 입력해 주세요.')
  if (form.body.trim().length < 5) return stop('#w-body', '내용을 5자 이상 입력해 주세요.')
  loading.value = true
  try {
    const res = await $fetch<{ id: string }>('/api/community/posts', { method: 'POST', body: { ...form } })
    toast.add({ title: '글을 올렸어요', color: 'success' })
    await navigateTo(res.id ? `/community/${res.id}` : '/community')
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="pb-6">
    <header class="sticky top-0 z-30 flex items-center gap-1 border-b border-line bg-white/95 px-2 backdrop-blur" style="height: calc(56px + env(safe-area-inset-top, 0px)); padding-top: env(safe-area-inset-top, 0px)">
      <button type="button" class="grid size-11 shrink-0 place-items-center rounded-full text-ink" aria-label="뒤로가기" @click="back">
        <AppIcon name="back" class="size-6" />
      </button>
      <h1 data-page-title tabindex="-1" class="text-[1.125rem] font-extrabold text-ink">
        글쓰기
      </h1>
    </header>

    <form class="space-y-4 px-4 pt-4" novalidate @submit.prevent="submit">
      <fieldset>
        <legend class="text-[0.9375rem] font-bold text-ink">
          게시판
        </legend>
        <div class="no-scrollbar -mx-4 mt-1.5 flex gap-2 overflow-x-auto px-4">
          <button v-for="b in boards" :key="b.key" type="button" class="chip" :aria-pressed="form.board === b.key" @click="form.board = b.key">
            <span aria-hidden="true" class="me-1">{{ b.emoji }}</span>{{ b.label }}
          </button>
        </div>
      </fieldset>

      <template v-if="form.board === 'review'">
        <div>
          <label for="w-biz" class="text-[0.9375rem] font-bold text-ink">어떤 업체인가요? (선택)</label>
          <select id="w-biz" v-model="form.businessId" class="field mt-1.5">
            <option value="">
              업체를 고르지 않아도 돼요
            </option>
            <option v-for="b in real" :key="b.slug" :value="b.slug">
              {{ b.name }}
            </option>
          </select>
        </div>
        <fieldset>
          <legend class="text-[0.9375rem] font-bold text-ink">
            별점 <span class="text-brand-600">*</span>
          </legend>
          <div id="w-rating" class="mt-1 flex gap-1">
            <button v-for="n in 5" :key="n" type="button" class="grid size-11 place-items-center rounded-xl text-[1.75rem] leading-none" :class="n <= form.rating ? 'text-gold-500' : 'text-line'" :aria-label="`${n}점`" :aria-pressed="form.rating === n" @click="form.rating = n">
              ★
            </button>
          </div>
        </fieldset>
      </template>

      <div>
        <label for="w-title" class="text-[0.9375rem] font-bold text-ink">제목 <span class="text-brand-600">*</span></label>
        <input id="w-title" v-model="form.title" maxlength="80" class="field mt-1.5" placeholder="제목을 입력해 주세요">
      </div>
      <div>
        <label for="w-body" class="text-[0.9375rem] font-bold text-ink">내용 <span class="text-brand-600">*</span></label>
        <textarea id="w-body" v-model="form.body" maxlength="3000" class="field mt-1.5" style="min-height: 220px" :placeholder="current.placeholder" />
        <p class="mt-1 text-right text-[0.8125rem] text-ink-2">
          {{ form.body.length }} / 3000
        </p>
      </div>

      <div class="hidden" aria-hidden="true"><input v-model="form.website" type="text" name="website" tabindex="-1" autocomplete="off"></div>

      <p class="rounded-2xl bg-fill p-3 text-[0.8125rem] leading-relaxed text-ink-2">
        <span aria-hidden="true">🙏 </span>전화번호·계좌번호 같은 개인 정보는 올리지 마세요. 욕설, 광고, 허위 정보는 신고가 쌓이면 숨겨질 수 있어요.
      </p>

      <p v-if="error" class="rounded-lg bg-red-50 p-3 text-[0.9375rem] font-bold text-red-700" role="alert">
        {{ error }}
      </p>
      <button type="submit" class="btn btn-primary w-full" :disabled="loading">
        {{ loading ? '올리는 중…' : '올리기' }}
      </button>
    </form>
  </div>
</template>
