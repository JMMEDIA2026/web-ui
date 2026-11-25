<script setup lang="ts">
import { categories, categoryMap } from '~/data/businesses'
import { regionByKey } from '~/data/regions'
import type { ExplorerState } from '~/composables/useExplorerState'

// 업체 탐색: 지역·검색·필터 → 상단 지도 → 하단 업체 목록 (laosmoa_mobile_design.md 4장)
definePageMeta({ region: true, explorer: true })

useSeoMeta({
  title: '업체 탐색 · 라자',
  description: '지도를 보며 라오스 한인 업체와 주변 업체를 찾아보세요.'
})

interface View { lat: number, lng: number, zoom: number }
type Bounds = [number, number, number, number]

const route = useRoute()
const router = useRouter()
const { regionKey, region, setRegion } = useRegion()
const regionSheet = useRegionSheet()
const { real, pending, error, refresh } = await useBusinessList()
const store = useExplorerState()

const str = (v: unknown) => (typeof v === 'string' ? v : '')
const validCategory = (v: string) => (categories.some(c => c.key === v) ? v : '')

// 처음 값은 주소(?q=&category=&region=)에서 읽습니다. (홈에서 넘어온 검색어·업종·지역)
const q = ref(str(route.query.q))
const searchInput = ref(q.value)
const category = ref(validCategory(str(route.query.category)))
if (str(route.query.region)) regionKey.value = regionByKey(str(route.query.region)).key

const selected = ref('')
const sort = ref('default')
const bounds = ref<Bounds | null>(null)
const expanded = ref(false)
const fitToken = ref(0)
const moved = ref(false)
const userLoc = ref<{ lat: number, lng: number } | null>(null)
const initialView = ref<View | null>(null)
const lastView = ref<View | null>(null)

const mapRef = ref<{ invalidate: () => void, getBounds: () => Bounds | null } | null>(null)
const listEl = ref<HTMLElement | null>(null)
let restoring = true

// ---------- 결과 계산 (지도 핀과 목록은 같은 결과를 씁니다) ----------
const inRegion = computed(() => real.value.filter(b => regionMatch(b, region.value)))

const distanceOf = (b: { lat?: number | null, lng?: number | null }) =>
  userLoc.value && typeof b.lat === 'number' && typeof b.lng === 'number'
    ? distanceKm(userLoc.value.lat, userLoc.value.lng, b.lat, b.lng)
    : null

const filtered = computed(() => {
  const term = q.value.trim().toLowerCase()
  let list = inRegion.value.filter(b =>
    (!category.value || b.category === category.value)
    && (!term || searchText(b).includes(term))
  )
  if (bounds.value) {
    const [s, w, n, e] = bounds.value
    list = list.filter(b => typeof b.lat === 'number' && typeof b.lng === 'number' && b.lat >= s && b.lat <= n && b.lng >= w && b.lng <= e)
  }
  if (sort.value === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'ko'))
  if (sort.value === 'distance' && userLoc.value) {
    list = [...list].sort((a, b) => (distanceOf(a) ?? 1e9) - (distanceOf(b) ?? 1e9))
  }
  return list
})

const selectedBusiness = computed(() => filtered.value.find(b => b.slug === selected.value) ?? null)

// 업종 칩: 홈의 주요 업종 + 실제로 등록된 업종 + 현재 선택한 업종
const chipKeys = computed(() => {
  const keys = new Set(['food', 'mart', 'hospital', 'exchange', 'rent', 'massage'])
  for (const b of real.value) keys.add(b.category)
  if (category.value) keys.add(category.value)
  return categories.filter(c => keys.has(c.key))
})

const filterActive = computed(() => !!(q.value.trim() || category.value || bounds.value))

// ---------- 동작 ----------
function buildQuery() {
  return {
    ...(q.value.trim() ? { q: q.value.trim() } : {}),
    ...(category.value ? { category: category.value } : {}),
    region: regionKey.value
  }
}

function persist() {
  if (restoring) return
  store.save({
    q: q.value,
    category: category.value,
    region: regionKey.value,
    selected: selected.value,
    sort: sort.value,
    bounds: bounds.value,
    map: lastView.value,
    scroll: listEl.value?.scrollTop ?? 0,
    expanded: expanded.value
  })
}

// 검색·업종·지역이 바뀌면 선택과 지도 영역 검색을 풀고 지도를 결과에 맞춥니다.
function resetForNewResults() {
  if (restoring) return
  bounds.value = null
  selected.value = ''
  moved.value = false
  fitToken.value++
  if (listEl.value) listEl.value.scrollTop = 0
}

watch([q, category, regionKey], () => {
  resetForNewResults()
  if (!restoring) router.replace({ query: buildQuery() })
})
watch([selected, sort, bounds, expanded, q, category, regionKey], persist)

// 검색 결과가 바뀌어 선택한 업체가 사라지면 선택을 풉니다.
watch(filtered, (list) => {
  if (selected.value && !list.some(b => b.slug === selected.value)) selected.value = ''
})

function submitSearch() {
  q.value = searchInput.value.trim()
}
function clearSearch() {
  searchInput.value = ''
  q.value = ''
}
function setCategory(key: string) {
  category.value = key
}
function clearFilters() {
  searchInput.value = ''
  q.value = ''
  category.value = ''
  bounds.value = null
  fitToken.value++
}

function scrollRowIntoView(slug: string) {
  const list = listEl.value
  const row = document.getElementById(`biz-${slug}`)
  if (!list || !row) return
  const l = list.getBoundingClientRect()
  const r = row.getBoundingClientRect()
  // 선택한 업체가 목록에 보이지 않을 때만 움직입니다.
  if (r.top < l.top || r.bottom > l.bottom) row.scrollIntoView({ block: 'nearest', behavior: 'auto' })
}

function select(slug: string) {
  selected.value = slug
  nextTick(() => scrollRowIntoView(slug))
}

function onView(v: View) {
  lastView.value = v
  persist()
}

// 지도를 움직여도 목록은 그대로입니다. "이 지역에서 검색"을 눌러야 목록이 갱신됩니다.
function searchHere() {
  const b = mapRef.value?.getBounds()
  if (!b) return
  bounds.value = b
  moved.value = false
  if (listEl.value) listEl.value.scrollTop = 0
}
function clearBounds() {
  bounds.value = null
  fitToken.value++
}

function onLocated(pos: { lat: number, lng: number }) {
  userLoc.value = pos
}

function toggleExpanded() {
  expanded.value = !expanded.value
  nextTick(() => {
    mapRef.value?.invalidate()
    setTimeout(() => mapRef.value?.invalidate(), 260)
  })
}

let scrollTimer: ReturnType<typeof setTimeout> | undefined
function onScroll() {
  clearTimeout(scrollTimer)
  scrollTimer = setTimeout(persist, 200)
}

function restore(saved: ExplorerState) {
  q.value = saved.q
  searchInput.value = saved.q
  category.value = saved.category
  setRegion(saved.region)
  selected.value = saved.selected
  sort.value = saved.sort === 'distance' ? 'default' : saved.sort
  bounds.value = saved.bounds
  expanded.value = saved.expanded
  initialView.value = saved.map
  nextTick(() => { if (listEl.value) listEl.value.scrollTop = saved.scroll })
}

onMounted(async () => {
  const saved = store.load()
  const hasQuery = ['q', 'category', 'region'].some(k => route.query[k] !== undefined)
  const sameAsSaved = !!saved
    && saved.q === str(route.query.q)
    && saved.category === validCategory(str(route.query.category))
    && (!str(route.query.region) || saved.region === regionByKey(str(route.query.region)).key)

  if (saved && (!hasQuery || sameAsSaved)) {
    // 상세 화면에 다녀왔거나 하단 "업체" 메뉴로 돌아왔을 때: 직전 상태를 복원합니다.
    restore(saved)
    if (!hasQuery) router.replace({ query: { ...(saved.q ? { q: saved.q } : {}), ...(saved.category ? { category: saved.category } : {}), region: saved.region } })
  } else if (hasQuery) {
    // 홈에서 새 검색·업종으로 들어왔을 때
    if (str(route.query.region)) setRegion(str(route.query.region))
    fitToken.value++
  }
  await nextTick()
  restoring = false
  persist()
})

onBeforeUnmount(() => {
  clearTimeout(scrollTimer)
  persist()
})
</script>

<template>
  <div
    class="flex flex-col"
    style="height: calc(100dvh - 56px - env(safe-area-inset-top, 0px) - var(--nav-h, 64px) - env(safe-area-inset-bottom, 0px))"
  >
    <h1 data-page-title tabindex="-1" class="sr-only-title">
      업체 탐색
    </h1>

    <!-- 검색과 업종 필터 -->
    <div class="shrink-0 border-b border-line bg-surface px-4 pb-2 pt-3">
      <form class="relative" role="search" @submit.prevent="submitSearch">
        <label for="biz-search" class="sr-only">업체명이나 업종 검색</label>
        <input
          id="biz-search"
          v-model="searchInput"
          type="search"
          enterkeyhint="search"
          autocomplete="off"
          placeholder="업체명이나 업종을 검색하세요"
          class="field pr-[104px]"
        >
        <button
          v-if="searchInput"
          type="button"
          class="absolute right-12 top-1/2 grid size-11 -translate-y-1/2 place-items-center text-ink-2"
          aria-label="검색어 지우기"
          @click="clearSearch"
        >
          <AppIcon name="close" class="size-5" />
        </button>
        <button type="submit" class="absolute right-1 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-lg text-brand-600" aria-label="검색">
          <AppIcon name="search" class="size-6" />
        </button>
      </form>

      <div class="no-scrollbar -mx-4 mt-2 flex gap-2 overflow-x-auto px-4" role="group" aria-label="업종 필터">
        <button type="button" class="chip" :aria-pressed="!category" @click="setCategory('')">
          전체
        </button>
        <button
          v-for="c in chipKeys"
          :key="c.key"
          type="button"
          class="chip"
          :aria-pressed="category === c.key"
          @click="setCategory(c.key)"
        >
          {{ c.label }}
        </button>
      </div>
    </div>

    <!-- 상단 지도 (목록 크게 보기를 누르면 접힙니다) -->
    <div
      class="relative shrink-0 overflow-hidden bg-[#E6E2D2] transition-[height] duration-200"
      :style="{ height: expanded ? '0px' : 'min(300px, 38dvh)' }"
      :inert="expanded"
    >
      <ClientOnly>
        <BusinessMap
          ref="mapRef"
          :businesses="filtered"
          :selected="selected"
          :fit-token="fitToken"
          :center="region.center"
          :initial-view="initialView"
          @select="select"
          @view="onView"
          @moved="moved = true"
          @located="onLocated"
        />
        <template #fallback>
          <div class="grid h-full place-items-center text-[0.875rem] text-ink-2">
            지도를 불러오는 중…
          </div>
        </template>
      </ClientOnly>

      <button
        v-if="moved && !expanded"
        type="button"
        class="btn btn-primary btn-sm absolute left-1/2 top-3 z-[500] -translate-x-1/2 shadow-md"
        @click="searchHere"
      >
        이 지역에서 검색
      </button>

      <!-- 선택한 업체 요약 -->
      <div
        v-if="selectedBusiness"
        class="absolute inset-x-3 bottom-7 z-[500] flex items-center gap-2 rounded-lg bg-surface p-3 shadow-md"
        role="region"
        aria-label="선택한 업체"
      >
        <div class="min-w-0 flex-1">
          <p class="truncate text-[1rem] font-bold text-ink">
            {{ selectedBusiness.name }}
          </p>
          <p class="truncate text-[0.8125rem] text-ink-2">
            {{ categoryMap[selectedBusiness.category]?.label }} · {{ selectedBusiness.area || '비엔티안' }}
          </p>
        </div>
        <NuxtLink :to="`/businesses/${selectedBusiness.slug}`" class="btn btn-primary btn-sm">
          상세 보기
        </NuxtLink>
        <button type="button" class="grid size-11 shrink-0 place-items-center rounded-full text-ink-2" aria-label="선택 해제" @click="selected = ''">
          <AppIcon name="close" class="size-5" />
        </button>
      </div>
    </div>

    <!-- 결과 수 · 정렬 · 목록 크게 보기 -->
    <div class="flex shrink-0 items-center justify-between gap-2 border-y border-line bg-surface px-4 py-1.5">
      <p class="text-[0.9375rem] font-bold text-ink" aria-live="polite">
        결과 <span class="text-brand-600">{{ filtered.length }}</span>곳
      </p>
      <div class="flex items-center gap-2">
        <label for="biz-sort" class="sr-only">정렬</label>
        <select id="biz-sort" v-model="sort" class="min-h-11 rounded-lg border border-[#858C7A] bg-surface px-2 text-[0.875rem] text-ink">
          <option value="default">
            추천순
          </option>
          <option value="name">
            이름순
          </option>
          <option v-if="userLoc" value="distance">
            가까운순
          </option>
        </select>
        <button type="button" class="btn btn-quiet btn-sm" :aria-pressed="expanded" @click="toggleExpanded">
          <AppIcon :name="expanded ? 'map' : 'list'" class="size-5" />
          {{ expanded ? '지도 보기' : '목록 크게 보기' }}
        </button>
      </div>
    </div>

    <div v-if="bounds" class="flex shrink-0 items-center justify-between gap-2 bg-brand-100 px-4 py-1 text-[0.875rem] text-brand-600">
      <span class="font-bold">지도 영역 안의 업체만 보고 있어요</span>
      <button type="button" class="btn btn-sm min-h-11 text-brand-600 underline" @click="clearBounds">
        해제
      </button>
    </div>

    <!-- 하단 업체 목록 -->
    <div ref="listEl" class="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-surface" @scroll.passive="onScroll">
      <!-- 불러오는 중 -->
      <ul v-if="pending && !real.length" class="rows" aria-busy="true">
        <li v-for="n in 3" :key="n" class="flex gap-3 px-4 py-3">
          <span class="size-[88px] shrink-0 animate-pulse rounded-lg bg-line" />
          <span class="flex-1 space-y-2 pt-1">
            <span class="block h-5 w-2/3 animate-pulse rounded bg-line" />
            <span class="block h-4 w-1/2 animate-pulse rounded bg-line" />
          </span>
        </li>
      </ul>

      <!-- 연결 오류: 검색 조건은 그대로 둡니다. -->
      <div v-else-if="error" class="px-6 py-10 text-center" role="alert">
        <AppIcon name="warning" class="mx-auto size-8 text-ink-2" />
        <p class="mt-2 text-[1.0625rem] font-bold text-ink">
          업체 정보를 불러오지 못했어요
        </p>
        <p class="mt-1 text-[0.875rem] text-ink-2">
          검색 조건은 그대로 두었어요. 연결을 확인하고 다시 시도해 주세요.
        </p>
        <button type="button" class="btn btn-primary mt-4" @click="refresh()">
          다시 시도
        </button>
      </div>

      <!-- 결과 없음 -->
      <div v-else-if="!filtered.length" class="px-6 py-10 text-center">
        <AppIcon name="search" class="mx-auto size-8 text-ink-2" />
        <p class="mt-2 text-[1.125rem] font-bold text-ink">
          {{ !real.length ? '아직 등록된 업체가 없어요' : !inRegion.length ? `${region.label}에는 아직 등록된 업체가 없어요` : '검색 결과가 없어요' }}
        </p>
        <ul class="mx-auto mt-3 flex max-w-xs flex-wrap justify-center gap-2 text-[0.875rem]">
          <li class="rounded-md bg-app-bg px-3 py-1 text-ink-2">
            지역 {{ region.label }}
          </li>
          <li v-if="category" class="rounded-md bg-app-bg px-3 py-1 text-ink-2">
            업종 {{ categoryMap[category]?.label }}
          </li>
          <li v-if="q.trim()" class="rounded-md bg-app-bg px-3 py-1 text-ink-2">
            검색어 “{{ q.trim() }}”
          </li>
          <li v-if="bounds" class="rounded-md bg-app-bg px-3 py-1 text-ink-2">
            지도 영역
          </li>
        </ul>
        <div class="mt-5 flex flex-col gap-2">
          <button v-if="filterActive" type="button" class="btn btn-primary" @click="clearFilters">
            필터 해제
          </button>
          <button type="button" class="btn btn-outline" @click="regionSheet = true">
            지역 변경
          </button>
          <NuxtLink to="/advertise" class="btn btn-quiet">
            사장님이세요? 업체 등록 문의
          </NuxtLink>
        </div>
      </div>

      <ul v-else class="rows">
        <BusinessRow
          v-for="b in filtered"
          :key="b.slug"
          :business="b"
          :selected="b.slug === selected"
          :distance="distanceOf(b)"
          @select="select"
        />
      </ul>
    </div>
  </div>
</template>
