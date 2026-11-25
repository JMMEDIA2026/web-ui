<script setup lang="ts">
import { businesses, categoryMap } from '~/data/businesses'

const route = useRoute()

const business = businesses.find(b => b.slug === route.params.slug)

if (!business) {
  throw createError({ statusCode: 404, statusMessage: '업체를 찾을 수 없습니다', fatal: true })
}

const category = categoryMap[business.category]

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
              <dd>{{ business.area }}</dd>
              <dt class="text-muted">
                영업시간
              </dt>
              <dd>{{ business.hours }}</dd>
              <dt class="text-muted">
                연락처
              </dt>
              <dd>{{ business.contact }}</dd>
            </dl>
          </UCard>
        </div>

        <div class="flex flex-col gap-4">
          <AdSlot title="상세 페이지 광고 자리" size="300×250" />
          <UButton to="/businesses" label="목록으로" color="neutral" variant="outline" icon="i-lucide-arrow-left" />
        </div>
      </div>
    </UPageBody>
  </UContainer>
</template>
