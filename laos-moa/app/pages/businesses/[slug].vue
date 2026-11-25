<script setup lang="ts">
import { categoryMap } from '~/data/businesses'

const route = useRoute()

// 등록된 업체(DB)와 화면 구성용 예시 업체를 함께 찾습니다.
const { all } = await useBusinessList()
const business = all.value.find(b => b.slug === route.params.slug)

if (!business) {
  throw createError({ statusCode: 404, statusMessage: '업체를 찾을 수 없습니다', fatal: true })
}

const category = categoryMap[business.category]
const hasLocation = typeof business.lat === 'number' && typeof business.lng === 'number'

// 지도(OpenStreetMap) 삽입 주소: 핀 주변을 보여 줍니다.
const embedUrl = computed(() => {
  if (!hasLocation) return ''
  const lat = business.lat as number
  const lng = business.lng as number
  const bbox = [lng - 0.004, lat - 0.003, lng + 0.004, lat + 0.003].map(n => n.toFixed(5)).join('%2C')
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`
})
const osmUrl = hasLocation
  ? `https://www.openstreetmap.org/?mlat=${business.lat}&mlon=${business.lng}#map=18/${business.lat}/${business.lng}`
  : ''

useSeoMeta({
  title: `${business.name} · 라오스모아`,
  description: business.description
})
</script>

<template>
  <UContainer v-if="business">
    <UPageHeader :title="business.name" :description="business.description">
      <template #headline>
        <UBreadcrumb
          :items="[
            { label: '한인 업체', to: '/businesses' },
            { label: category.label, to: `/businesses?category=${category.key}` }
          ]"
        />
      </template>
      <template #links>
        <UBadge v-if="business.sponsored" label="추천 업체 · 광고" color="secondary" variant="solid" />
        <UBadge v-if="business.example" label="예시" color="neutral" variant="soft" />
      </template>
    </UPageHeader>

    <UPageBody>
      <div class="grid gap-8 lg:grid-cols-3">
        <div class="lg:col-span-2 flex flex-col gap-6">
          <UAlert
            v-if="business.example"
            color="warning"
            variant="subtle"
            icon="i-lucide-info"
            title="예시 업체입니다"
            description="실제 업체 정보를 등록하기 전까지 화면 구성을 보여주기 위한 예시 정보입니다."
          />

          <UCard class="box3d">
            <template #header>
              <div class="flex items-center gap-3">
                <img :src="category.emoji" alt="" class="size-10">
                <h2 class="font-semibold text-lg">
                  업체 정보
                </h2>
              </div>
            </template>

            <dl class="grid gap-4 sm:grid-cols-[8rem_1fr]">
              <dt class="text-muted">
                분야
              </dt>
              <dd>{{ category.label }}</dd>
              <dt class="text-muted">
                지역
              </dt>
              <dd>{{ business.area || '비엔티안' }}</dd>
              <template v-if="business.address">
                <dt class="text-muted">
                  주소
                </dt>
                <dd class="break-words">
                  {{ business.address }}
                </dd>
              </template>
              <dt class="text-muted">
                영업시간
              </dt>
              <dd>{{ business.hours || '확인 후 추가될 예정입니다' }}</dd>
              <dt class="text-muted">
                연락처
              </dt>
              <dd>{{ business.contact || '확인 후 추가될 예정입니다' }}</dd>
            </dl>
          </UCard>

          <UCard v-if="hasLocation" class="box3d">
            <template #header>
              <h2 class="font-semibold text-lg">
                위치
              </h2>
            </template>
            <iframe
              :src="embedUrl"
              :title="`${business.name} 위치 지도`"
              class="h-72 w-full border border-default"
              loading="lazy"
              referrerpolicy="no-referrer"
            />
            <div class="mt-3 flex flex-wrap gap-2">
              <UButton
                v-if="business.mapUrl"
                :to="business.mapUrl"
                target="_blank"
                label="Google 지도에서 열기"
                icon="i-lucide-map-pin"
                color="neutral"
                variant="outline"
              />
              <UButton :to="osmUrl" target="_blank" label="OpenStreetMap에서 크게 보기" icon="i-lucide-map" color="neutral" variant="ghost" />
            </div>
            <p class="mt-2 text-xs text-muted">
              지도 위치는 OpenStreetMap 기준이며 실제 위치와 조금 다를 수 있습니다. 방문 전 업체에 확인하세요.
            </p>
          </UCard>
        </div>

        <div class="flex flex-col gap-4">
          <!-- 사장님 계정이 연결된(예약을 받을 수 있는) 업체에만 예약 버튼을 보여 줍니다. -->
          <UButton
            v-if="business.partnerId"
            :to="`/reserve?partner=${business.partnerId}`"
            label="예약 요청하기"
            icon="i-lucide-calendar-check"
            size="xl"
            block
          />
          <AdSlot title="상세 페이지 광고 자리" size="300×250" />
          <UButton to="/businesses" label="목록으로" color="neutral" variant="outline" icon="i-lucide-arrow-left" />
        </div>
      </div>
    </UPageBody>
  </UContainer>
</template>
