<script setup lang="ts">
import { businesses, categories } from '~/data/businesses'

useSeoMeta({
  title: '한인 업체 · 라오스모아',
  description: '라오스 한인 업체 디렉토리. 한식당, 마트, 병원, 학교, 렌트, 구인 정보.'
})

const route = useRoute()
const router = useRouter()

// 홈 검색창에서 넘어온 검색어(?q=)를 처음 값으로 씁니다.
const query = ref(typeof route.query.q === 'string' ? route.query.q : '')
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
  <div>
    <section class="border-b border-default">
      <UContainer class="py-12 sm:py-14">
        <h1 class="text-3xl font-extrabold tracking-tight text-highlighted sm:text-4xl">
          한인 업체
        </h1>
        <p class="mt-2 text-muted">
          한인이 운영하거나 한인이 자주 찾는 곳을 모았습니다.
        </p>

        <UInput
          v-model="query"
          icon="i-lucide-search"
          placeholder="업체명, 지역, 키워드 검색"
          size="xl"
          class="mt-6 max-w-md"
          :ui="{ base: 'bg-white' }"
          aria-label="업체 검색"
        />

        <div class="mt-4 flex flex-wrap gap-2">
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
            :class="selected === c.key ? '' : 'bg-white'"
            @click="pick(c.key)"
          />
        </div>
      </UContainer>
    </section>

    <UContainer class="py-10">
      <AdSlot title="목록 상단 배너 광고 자리" size="PC 728×90 · 모바일 320×100" />

      <p class="mt-8 text-sm text-muted">
        총 <b class="text-highlighted">{{ filtered.length }}</b>곳
      </p>

      <div v-if="filtered.length" class="mt-4 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <BusinessCard v-for="b in filtered" :key="b.slug" :business="b" />
      </div>
      <UEmpty
        v-else
        class="mt-8"
        icon="i-lucide-search-x"
        title="검색 결과가 없습니다"
        description="다른 검색어를 입력하거나 분야를 바꿔 보세요."
      />
    </UContainer>
  </div>
</template>
