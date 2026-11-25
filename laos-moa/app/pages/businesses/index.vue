<script setup lang="ts">
import { businesses, categories } from '~/data/businesses'

useSeoMeta({
  title: '한인 업체 · 라오스모아',
  description: '라오스 한인 업체 디렉토리. 한식당, 마트, 병원, 학교, 렌트, 구인 정보.'
})

const route = useRoute()
const router = useRouter()

const query = ref('')
const selected = computed(() => (typeof route.query.category === 'string' ? route.query.category : ''))

function pick(key: string) {
  router.replace({ query: key && key !== selected.value ? { category: key } : {} })
}

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  const list = businesses.filter(b =>
    (!selected.value || b.category === selected.value)
    && (!q || `${b.name} ${b.description} ${b.area}`.toLowerCase().includes(q))
  )
  // 추천(광고) 업체를 목록 맨 위에 둡니다.
  return [...list].sort((a, b) => Number(!!b.sponsored) - Number(!!a.sponsored))
})
</script>

<template>
  <UContainer>
    <UPageHeader title="한인 업체" description="한인이 운영하거나 한인이 자주 찾는 곳을 모았습니다." />

    <UPageBody>
      <div class="flex flex-col gap-4">
        <UInput v-model="query" icon="i-lucide-search" placeholder="업체명, 지역, 키워드 검색" size="xl" class="max-w-md" />

        <div class="flex flex-wrap gap-2">
          <UButton
            label="전체"
            size="sm"
            :color="selected ? 'neutral' : 'primary'"
            :variant="selected ? 'outline' : 'solid'"
            @click="pick('')"
          />
          <UButton
            v-for="c in categories"
            :key="c.key"
            :label="c.label"
            size="sm"
            :color="selected === c.key ? 'primary' : 'neutral'"
            :variant="selected === c.key ? 'solid' : 'outline'"
            @click="pick(c.key)"
          />
        </div>
      </div>

      <AdSlot class="mt-8" title="목록 상단 배너 광고 자리" size="PC 728×90 · 모바일 320×100" />

      <UPageGrid v-if="filtered.length" class="mt-8 lg:grid-cols-3">
        <BusinessCard v-for="b in filtered" :key="b.slug" :business="b" />
      </UPageGrid>
      <UEmpty
        v-else
        class="mt-8"
        icon="i-lucide-search-x"
        title="검색 결과가 없습니다"
        description="다른 검색어를 입력하거나 분야를 바꿔 보세요."
      />
    </UPageBody>
  </UContainer>
</template>
