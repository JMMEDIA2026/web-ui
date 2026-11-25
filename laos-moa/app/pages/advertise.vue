<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

useSeoMeta({
  title: '업체 등록·광고 안내 · 라오스모아',
  description: '한인 업체 무료 등록, 추천 업체, 배너 광고 안내와 문의.'
})

const tiers = [
  {
    level: '기본',
    title: '무료 등록',
    items: ['업체 기본 정보 등록', '지도·연락처 표시', '후기 받기'],
    price: '무료'
  },
  {
    level: '추천',
    title: '프리미엄 업체',
    items: ['목록 상단 노출과 추천 배지', '사진 여러 장과 메뉴 소개', '카카오톡 문의 버튼'],
    price: '가격은 오픈 후 안내합니다.'
  },
  {
    level: '프리미엄 플러스',
    title: '배너 광고',
    items: ['메인·게시판 배너 노출', '이벤트·할인 소식 게시', '노출·클릭 현황 보고'],
    price: '가격은 오픈 후 안내합니다.'
  }
]

const productOptions = [
  { label: '무료 업체 등록', value: 'free' },
  { label: '프리미엄 업체', value: 'premium' },
  { label: '배너 광고', value: 'banner' },
  { label: '제휴·기타', value: 'etc' }
]

const schema = z.object({
  company: z.string().min(1, '업체명을 입력하세요'),
  contact: z.string().min(2, '카카오톡 ID 또는 연락처를 입력하세요'),
  product: z.string().min(1, '문의 종류를 선택하세요'),
  message: z.string().optional(),
  website: z.string().optional() // 스팸 방지용 숨김 필드
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  company: '',
  contact: '',
  product: undefined,
  message: '',
  website: ''
})

const toast = useToast()
const loading = ref(false)

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    await $fetch('/api/inquiry', { method: 'POST', body: event.data })
    toast.add({ title: '문의가 접수되었습니다', description: '확인 후 연락드리겠습니다.', color: 'success' })
    Object.assign(state, { company: '', contact: '', product: undefined, message: '', website: '' })
  } catch {
    toast.add({ title: '접수에 실패했습니다', description: '잠시 후 다시 시도해 주세요.', color: 'error' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <UPageHero
      headline="업체 등록·광고"
      title="한인 고객에게 업체를 알리세요."
      description="라오스 한인이 찾는 곳에 업체를 소개합니다. 등록은 무료로 시작할 수 있습니다."
    />

    <UPageSection title="이용 안내" description="상세 조건은 시안이며, 실제 운영 전에 확정합니다.">
      <UPageGrid class="lg:grid-cols-3">
        <UPageCard
          v-for="t in tiers"
          :key="t.title"
          :title="t.title"
          :description="t.level"
          variant="outline"
          :class="['box3d', t.level === '추천' ? 'ring-2 ring-primary' : '']"
        >
          <ul class="flex flex-col gap-2 text-sm">
            <li v-for="i in t.items" :key="i" class="flex items-start gap-2">
              <UIcon name="i-lucide-check" class="mt-0.5 shrink-0 text-primary" />
              {{ i }}
            </li>
          </ul>
          <p class="mt-4 text-sm text-muted">
            {{ t.price }}
          </p>
        </UPageCard>
      </UPageGrid>
      <p class="mt-4 text-sm text-muted">
        모든 광고에는 ‘광고’ 표시를 넣어 일반 정보와 구분합니다.
      </p>
    </UPageSection>

    <UPageSection id="inquiry" title="광고·제휴 문의" description="업체명과 연락처를 남겨 주시면 확인 후 연락드립니다.">
      <UCard class="box3d mx-auto w-full max-w-xl">
        <UForm :schema="schema" :state="state" class="flex flex-col gap-4" @submit="onSubmit">
          <UFormField label="업체명" name="company" required>
            <UInput v-model="state.company" placeholder="예) 라오스 한식당" class="w-full" />
          </UFormField>

          <UFormField label="카카오톡 ID 또는 연락처" name="contact" required>
            <UInput v-model="state.contact" placeholder="카카오톡 ID 또는 전화번호" class="w-full" />
          </UFormField>

          <UFormField label="문의 종류" name="product" required>
            <USelect v-model="state.product" :items="productOptions" placeholder="선택하세요" class="w-full" />
          </UFormField>

          <UFormField label="문의 내용" name="message">
            <UTextarea v-model="state.message" :rows="4" placeholder="업체 소개나 원하시는 내용을 적어 주세요." class="w-full" />
          </UFormField>

          <!-- 스팸 방지용 숨김 필드: 사람은 채우지 않습니다. -->
          <div class="hidden" aria-hidden="true">
            <input v-model="state.website" type="text" name="website" tabindex="-1" autocomplete="off">
          </div>

          <UButton type="submit" label="문의 보내기" size="lg" :loading="loading" block />
        </UForm>
      </UCard>
    </UPageSection>
  </div>
</template>
