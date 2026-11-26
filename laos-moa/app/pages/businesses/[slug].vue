<script setup lang="ts">
import { categoryMap } from '~/data/businesses'
import { parseContacts } from '../../../shared/utils/contact'

// 상세 화면은 하단 메뉴 대신 하단 행동 바(길찾기·연락하기·예약)를 씁니다.
definePageMeta({ header: false, nav: false })

const route = useRoute()
const router = useRouter()
const toast = useToast()

const { real } = await useBusinessList()
const business = real.value.find(b => b.slug === route.params.slug)

if (!business) {
  throw createError({ statusCode: 404, statusMessage: '업체를 찾을 수 없어요', fatal: true })
}

const category = categoryMap[business.category]
const EMOJI: Record<string, string> = { food: '🍚', mart: '🛒', exchange: '💱', massage: '💆', hospital: '🏥', school: '🎓', rent: '🏠', job: '💼' }
const catEmoji = EMOJI[business.category] ?? '🏷️'
const located = hasCoords(business)
const directions = directionsUrl(business)
const contact = contactAction(business.contact)
const contacts = parseContacts(business.contact)
const firstType = contacts[0]?.type ?? 'etc'

// 구글 지도(API 키 없이 쓰는 삽입 지도와 링크)
const embedUrl = located
  ? `https://www.google.com/maps?q=${business.lat},${business.lng}&z=17&output=embed&hl=ko`
  : business.address
    ? `https://www.google.com/maps?q=${encodeURIComponent(business.address)}&z=16&output=embed&hl=ko`
    : ''
const googleOpenUrl = /^https:\/\//i.test(business.mapUrl ?? '')
  ? business.mapUrl!
  : located
    ? `https://www.google.com/maps/search/?api=1&query=${business.lat},${business.lng}`
    : business.address
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`
      : ''

// 이 업체에 달린 후기 개수
const { data: reviewData } = await useFetch<{ total: number }>('/api/community/posts', { key: `reviews-${business.slug}`, query: { board: 'review', business: business.slug, limit: 1 }, default: () => ({ total: 0 }) })
const reviewCount = computed(() => reviewData.value?.total ?? 0)

const checkedOn = business.updatedAt
  ? new Date(business.updatedAt).toLocaleDateString('ko-KR', { timeZone: 'Asia/Vientiane', year: 'numeric', month: 'long', day: 'numeric' })
  : ''

// 탐색 화면에서 왔으면 뒤로 가서 지도·목록 상태를 그대로 복원합니다.
function back() {
  if (router.options.history.state?.back) router.back()
  else navigateTo('/businesses')
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    toast.add({ title: '연락처를 복사했어요', color: 'success' })
  } catch {
    toast.add({ title: '복사하지 못했어요', description: text, color: 'warning' })
  }
}

useSeoMeta({
  title: `${business.name} · 라자`,
  description: business.description,
  ...(business.photos?.length ? { ogImage: `https://laja.joybox.day/api/photos/${business.photos[0]}` } : {})
})

const actionCount = [!!directions, !!contact, true].filter(Boolean).length
</script>

<template>
  <div class="min-h-dvh bg-default" :style="{ paddingBottom: actionCount ? 'calc(88px + env(safe-area-inset-bottom, 0px))' : '24px' }">
    <!-- 상단: 뒤로가기와 업체명 -->
    <header
      class="sticky top-0 z-30 flex items-center gap-1 border-b border-default bg-default px-2"
      style="height: calc(56px + env(safe-area-inset-top, 0px)); padding-top: env(safe-area-inset-top, 0px)"
    >
      <button type="button" class="grid size-11 shrink-0 place-items-center rounded-md text-highlighted" aria-label="뒤로가기" @click="back">
        <AppIcon name="back" class="size-7" />
      </button>
      <p class="min-w-0 flex-1 truncate text-[1.0625rem] font-bold text-highlighted">
        {{ business.name }}
      </p>
    </header>

    <!-- 실제 업체 사진이 아직 없으면 업종 아이콘을 보여 줍니다. -->
    <PhotoGallery v-if="business.photos?.length" :photos="business.photos" :name="business.name" />
    <img v-else :src="`/images/categories/${business.category}.jpg`" :alt="`${category?.label} 업종 대표 이미지`" width="1200" height="675" class="aspect-video w-full object-cover">

    <div class="px-4 pt-5 sm:px-5">
      <div class="flex flex-wrap items-center gap-2">
        <span class="inline-flex items-center gap-1 rounded-md bg-primary/10 px-3 py-1 text-[0.8125rem] font-bold text-primary">
          <span aria-hidden="true">{{ catEmoji }}</span>{{ category?.label }}
        </span>
        <span v-if="business.sponsored" class="inline-flex items-center gap-1 rounded-md bg-gold-50 px-3 py-1 text-[0.8125rem] font-bold text-gold-700">
          <span aria-hidden="true">⭐</span>광고
        </span>
      </div>
      <h1 data-page-title tabindex="-1" class="mt-2 text-[1.75rem] font-bold leading-tight text-highlighted [text-wrap:balance]">
        {{ business.name }}
      </h1>
      <p class="mt-1.5 flex items-center gap-1 text-[0.9375rem] text-muted">
        <span aria-hidden="true">📍</span>{{ business.area || '비엔티안' }}
      </p>

      <section class="card mt-5 overflow-hidden" aria-labelledby="info-title">
        <h2 id="info-title" class="flex items-center gap-2 px-4 pt-4 text-[1.125rem] font-bold text-highlighted">
          <span aria-hidden="true">🧭</span>업체 정보
        </h2>
        <ul class="mt-2 divide-y divide-default">
          <li v-if="business.address" class="flex gap-3 px-4 py-3">
            <span class="grid size-10 shrink-0 place-items-center rounded-md bg-primary/10 text-[1.25rem]" aria-hidden="true">📍</span>
            <div class="min-w-0 flex-1">
              <p class="text-[0.8125rem] text-muted">
                주소
              </p>
              <p class="break-words text-[1rem] leading-snug text-highlighted">
                {{ business.address }}
              </p>
              <button type="button" class="mt-1 inline-flex min-h-11 items-center gap-1 text-[0.875rem] font-bold text-primary underline underline-offset-4" @click="copy(business.address!)">
                <span aria-hidden="true">📋</span>주소 복사
              </button>
            </div>
          </li>
          <!-- 영업시간은 확인된 업체만 보여 줍니다. 없으면 이 줄 자체를 생략합니다. -->
          <li v-if="business.hours" class="flex gap-3 px-4 py-3">
            <span class="grid size-10 shrink-0 place-items-center rounded-md bg-primary/10 text-[1.25rem]" aria-hidden="true">🕒</span>
            <div class="min-w-0 flex-1">
              <p class="text-[0.8125rem] text-muted">
                영업시간
              </p>
              <p class="text-[1rem] text-highlighted">
                {{ business.hours }}
              </p>
            </div>
          </li>
        </ul>
      </section>

      <!-- 연락처: 로고 아이콘만 한 줄, 누르면 아이디와 복사 버튼 -->
      <section class="card mt-3 p-4" aria-labelledby="contact-title">
        <h2 id="contact-title" class="flex items-center gap-2 text-[1.125rem] font-extrabold text-highlighted">
          <span aria-hidden="true">📞</span>연락처
        </h2>
        <ContactIcons v-if="contacts.length" :items="contacts" class="mt-3" />
        <p v-else class="mt-2 text-[1rem] text-muted">
          등록된 연락처가 없어요
        </p>
      </section>

      <section v-if="business.description" class="card mt-3 p-4" aria-labelledby="intro-title">
        <h2 id="intro-title" class="flex items-center gap-2 text-[1.125rem] font-bold text-highlighted">
          <span aria-hidden="true">✨</span>소개
        </h2>
        <p class="mt-2 text-[1rem] leading-relaxed text-highlighted">
          {{ business.description }}
        </p>
      </section>

      <section class="card mt-3 p-4" aria-labelledby="rv-title">
        <h2 id="rv-title" class="flex items-center gap-2 text-[1.125rem] font-extrabold text-highlighted">
          <span aria-hidden="true">⭐</span>후기
        </h2>
        <p class="mt-1 text-[0.9375rem] text-muted">
          {{ reviewCount ? `이용한 분들의 후기가 ${reviewCount}개 있어요.` : '아직 후기가 없어요. 다녀오셨다면 첫 후기를 남겨 주세요.' }}
        </p>
        <div class="mt-3 flex flex-wrap gap-2">
          <UButton color="neutral" variant="outline" size="md" v-if="reviewCount" :to="{ path: '/community', query: { board: 'review', business: business.slug } }">
            후기 보기
          </UButton>
          <UButton color="primary" variant="solid" size="md" :to="{ path: '/community/write', query: { board: 'review', business: business.slug } }">
            <span aria-hidden="true">✏️</span>후기 쓰기
          </UButton>
        </div>
      </section>

      <section v-if="embedUrl" class="card mt-3 overflow-hidden" aria-labelledby="loc-title">
        <h2 id="loc-title" class="flex items-center gap-2 px-4 pt-4 text-[1.125rem] font-bold text-highlighted">
          <span aria-hidden="true">🗺️</span>위치 안내
        </h2>
        <iframe
          :src="embedUrl"
          :title="`${business.name} 위치 지도`"
          class="mt-3 h-64 w-full border-0"
          loading="lazy"
          referrerpolicy="no-referrer"
        />
        <div class="flex flex-wrap items-center gap-x-3 px-4 py-3">
          <a v-if="googleOpenUrl" :href="googleOpenUrl" target="_blank" rel="noopener" class="inline-flex min-h-11 items-center gap-1 font-bold text-primary underline underline-offset-2">
            <span aria-hidden="true">🔎</span>
            구글 지도에서 열기
          </a>
          <p class="text-[0.8125rem] leading-snug text-muted">
            지도 위치는 실제와 조금 다를 수 있어요. 방문 전에 업체에 확인해 주세요.
          </p>
        </div>
      </section>

      <!-- 정보 확인일과 수정 제안 -->
      <p class="mt-4 text-[0.8125rem] leading-relaxed text-muted">
        <template v-if="checkedOn"><span aria-hidden="true">🗓️ </span>정보 확인일 {{ checkedOn }}. </template>
        정보가 다르거나 바뀌었나요?
        <NuxtLink :to="{ path: '/advertise', query: { type: 'correction', company: business.name }, hash: '#inquiry' }" class="inline-flex min-h-11 items-center font-bold text-primary underline underline-offset-2">정보 수정 요청하기</NuxtLink>
      </p>
    </div>

    <!-- 하단 고정 행동 바 -->
    <div
      v-if="actionCount"
      class="fixed bottom-0 left-1/2 z-40 w-full max-w-[560px] -translate-x-1/2 border-t border-default bg-default px-4 pt-3"
      style="padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px))"
    >
      <div class="grid gap-2" style="grid-template-columns: repeat(auto-fit, minmax(6.5rem, 1fr))">
        <UButton color="neutral" variant="outline" size="lg" class="min-w-0 px-2 text-[0.9375rem]" v-if="directions" :href="directions" target="_blank" rel="noopener">
          <AppIcon name="compass" class="size-5" />
          길찾기
        </UButton>
        <template v-if="contact">
          <UButton color="neutral" variant="outline" size="lg" class="min-w-0 px-2 text-[0.9375rem]" v-if="contact.kind === 'tel'" :href="contact.href">
            <SnsIcon :type="firstType" class="size-5" />
            {{ contact.label }}
          </UButton>
          <UButton color="neutral" variant="outline" size="lg" class="min-w-0 px-2 text-[0.9375rem]" v-else-if="contact.kind === 'link'" :href="contact.href" target="_blank" rel="noopener">
            <SnsIcon :type="firstType" class="size-5" />
            {{ contact.label }}
          </UButton>
          <UButton color="neutral" variant="outline" size="lg" class="min-w-0 px-2 text-[0.9375rem]" v-else type="button"  @click="copy(contact.text)">
            <SnsIcon :type="firstType" class="size-5" />
            {{ contact.label }}
          </UButton>
        </template>
        <UButton color="primary" variant="solid" size="lg" class="min-w-0 px-2 text-[0.9375rem]" :to="{ path: '/reserve', query: { business: business.slug } }">
          <span aria-hidden="true">📅</span>
          예약 요청
        </UButton>
      </div>
    </div>
  </div>
</template>
