<script setup lang="ts">
import { categoryMap } from '~/data/businesses'

// 상세 화면은 하단 메뉴 대신 하단 행동 바(길찾기·연락하기·예약)를 씁니다.
definePageMeta({ header: false, nav: false })

const route = useRoute()
const router = useRouter()
const toast = useToast()

const { real } = await useBusinessList()
const business = real.value.find(b => b.slug === route.params.slug)

if (!business) {
  throw createError({ statusCode: 404, statusMessage: '업체를 찾을 수 없습니다', fatal: true })
}

const category = categoryMap[business.category]
const located = hasCoords(business)
const directions = directionsUrl(business)
const contact = contactAction(business.contact)

const embedUrl = located
  ? `https://www.openstreetmap.org/export/embed.html?bbox=${[business.lng! - 0.004, business.lat! - 0.003, business.lng! + 0.004, business.lat! + 0.003].map(n => n.toFixed(5)).join('%2C')}&layer=mapnik&marker=${business.lat}%2C${business.lng}`
  : ''

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
  description: business.description
})

const actionCount = [!!directions, !!contact, !!business.partnerId].filter(Boolean).length
</script>

<template>
  <div class="min-h-dvh bg-app-bg" :style="{ paddingBottom: actionCount ? 'calc(88px + env(safe-area-inset-bottom, 0px))' : '24px' }">
    <!-- 상단: 뒤로가기와 업체명 -->
    <header
      class="sticky top-0 z-30 flex items-center gap-1 border-b border-line bg-white px-2"
      style="height: calc(56px + env(safe-area-inset-top, 0px)); padding-top: env(safe-area-inset-top, 0px)"
    >
      <button type="button" class="grid size-11 shrink-0 place-items-center rounded-full text-ink" aria-label="뒤로가기" @click="back">
        <UIcon name="i-lucide-chevron-left" class="size-7" />
      </button>
      <p class="min-w-0 flex-1 truncate text-[1.0625rem] font-bold text-ink">
        {{ business.name }}
      </p>
    </header>

    <!-- 실제 업체 사진이 아직 없으면 업종 아이콘을 보여 줍니다. -->
    <div class="grid h-44 place-items-center bg-brand-50 text-brand-600" role="img" :aria-label="`${category?.label} 업종`">
      <img v-if="category?.emoji" :src="category.emoji" alt="" width="96" height="96" class="size-24 object-contain">
      <UIcon v-else name="i-lucide-store" class="size-14" />
    </div>

    <div class="px-4 pt-5 sm:px-5">
      <div class="flex flex-wrap items-center gap-2">
        <span class="rounded-md bg-brand-100 px-2 py-0.5 text-[0.8125rem] font-bold text-brand-600">{{ category?.label }}</span>
        <span v-if="business.sponsored" class="rounded-md bg-brand-100 px-2 py-0.5 text-[0.8125rem] font-bold text-brand-600">광고</span>
      </div>
      <h1 data-page-title tabindex="-1" class="mt-2 text-[1.625rem] font-bold leading-tight text-ink">
        {{ business.name }}
      </h1>

      <section class="card mt-5 p-4" aria-labelledby="info-title">
        <h2 id="info-title" class="text-[1.125rem] font-bold text-ink">
          업체 정보
        </h2>
        <dl class="mt-3 space-y-3 text-[1rem]">
          <div>
            <dt class="text-[0.8125rem] text-ink-2">
              지역
            </dt>
            <dd class="text-ink">
              {{ business.area || '비엔티안' }}
            </dd>
          </div>
          <div v-if="business.address">
            <dt class="text-[0.8125rem] text-ink-2">
              주소
            </dt>
            <dd class="break-words text-ink">
              {{ business.address }}
            </dd>
          </div>
          <div>
            <dt class="text-[0.8125rem] text-ink-2">
              영업시간
            </dt>
            <dd :class="business.hours ? 'text-ink' : 'text-ink-2'">
              {{ business.hours || '정보 확인 중이에요' }}
            </dd>
          </div>
          <div>
            <dt class="text-[0.8125rem] text-ink-2">
              연락처
            </dt>
            <dd :class="business.contact ? 'text-ink' : 'text-ink-2'" class="break-words">
              {{ business.contact || '정보 확인 중이에요' }}
            </dd>
          </div>
        </dl>
      </section>

      <section v-if="business.description" class="card mt-3 p-4" aria-labelledby="intro-title">
        <h2 id="intro-title" class="text-[1.125rem] font-bold text-ink">
          소개
        </h2>
        <p class="mt-2 text-[1rem] leading-relaxed text-ink">
          {{ business.description }}
        </p>
      </section>

      <section v-if="located" class="card mt-3 overflow-hidden" aria-labelledby="loc-title">
        <h2 id="loc-title" class="px-4 pt-4 text-[1.125rem] font-bold text-ink">
          위치 안내
        </h2>
        <iframe
          :src="embedUrl"
          :title="`${business.name} 위치 지도`"
          class="mt-3 h-64 w-full border-0"
          loading="lazy"
          referrerpolicy="no-referrer"
        />
        <p class="px-4 py-3 text-[0.8125rem] leading-snug text-ink-2">
          지도 위치는 OpenStreetMap 기준이라 실제 위치와 조금 다를 수 있어요. 방문 전에 업체에 확인하세요.
        </p>
      </section>

      <!-- 정보 확인일과 수정 제안 -->
      <p class="mt-4 text-[0.8125rem] leading-relaxed text-ink-2">
        <template v-if="checkedOn">정보 확인일 {{ checkedOn }}. </template>
        정보가 다르거나 바뀌었나요?
        <NuxtLink to="/advertise#inquiry" class="inline-flex min-h-11 items-center font-bold text-brand-600 underline underline-offset-2">수정 제안하기</NuxtLink>
      </p>
    </div>

    <!-- 하단 고정 행동 바 -->
    <div
      v-if="actionCount"
      class="fixed bottom-0 left-1/2 z-40 w-full max-w-[560px] -translate-x-1/2 border-t border-line bg-white px-4 pt-3"
      style="padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px))"
    >
      <div class="grid gap-2" :style="{ gridTemplateColumns: `repeat(${actionCount}, minmax(0, 1fr))` }">
        <a v-if="directions" :href="directions" target="_blank" rel="noopener" class="btn btn-outline">
          <UIcon name="i-lucide-navigation" class="size-5" />
          길찾기
        </a>
        <template v-if="contact">
          <a v-if="contact.kind === 'tel'" :href="contact.href" class="btn btn-outline">
            <UIcon name="i-lucide-phone" class="size-5" />
            {{ contact.label }}
          </a>
          <a v-else-if="contact.kind === 'link'" :href="contact.href" target="_blank" rel="noopener" class="btn btn-outline">
            <UIcon name="i-lucide-phone" class="size-5" />
            {{ contact.label }}
          </a>
          <button v-else type="button" class="btn btn-outline" @click="copy(contact.text)">
            <UIcon name="i-lucide-copy" class="size-5" />
            {{ contact.label }}
          </button>
        </template>
        <NuxtLink v-if="business.partnerId" :to="`/reserve?partner=${business.partnerId}`" class="btn btn-primary">
          <UIcon name="i-lucide-calendar-check" class="size-5" />
          예약 요청
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
