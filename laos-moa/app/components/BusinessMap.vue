<script setup lang="ts">
import type { Business } from '~/data/businesses'

interface View {
  lat: number
  lng: number
  zoom: number
}

const props = defineProps<{
  businesses: Business[]
  selected: string
  /** 값이 바뀌면 지도를 검색 결과에 맞게 다시 맞춥니다. */
  fitToken: number
  /** 결과가 없을 때 보여 줄 지역 중심 */
  center: View
  /** 되돌아왔을 때 복원할 지도 위치 */
  initialView: View | null
}>()

const emit = defineEmits<{
  select: [slug: string]
  view: [view: View]
  moved: []
  located: [pos: { lat: number, lng: number }]
}>()

const el = ref<HTMLElement | null>(null)
const failed = ref(false)
const locating = ref(false)
const notice = ref('')

// Leaflet은 브라우저에서만 불러옵니다.
/* eslint-disable @typescript-eslint/no-explicit-any */
let L: any
let map: any
let cluster: any
let me: any
const markers = new Map<string, any>()
let quietUntil = 0
let tileLoads = 0
let tileErrors = 0
let noticeTimer: ReturnType<typeof setTimeout> | undefined

const pinSvg = '<svg width="36" height="44" viewBox="0 0 36 44" aria-hidden="true"><path d="M18 2C9.7 2 3 8.6 3 16.8 3 27.6 18 42 18 42s15-14.4 15-25.2C33 8.6 26.3 2 18 2z" fill="#C2410C" stroke="#fff" stroke-width="3"/><circle cx="18" cy="17" r="5.5" fill="#fff"/></svg>'

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }[c] as string))

function iconFor(b: Business, isSelected: boolean) {
  return L.divIcon({
    className: `lm-pin${isSelected ? ' is-selected' : ''}`,
    html: `${isSelected ? `<span class="lm-label">${escapeHtml(b.name)}</span>` : ''}${pinSvg}`,
    iconSize: [44, 48],
    iconAnchor: [22, 46]
  })
}

function quiet(ms = 700) {
  quietUntil = Date.now() + ms
}

function say(message: string) {
  notice.value = message
  clearTimeout(noticeTimer)
  noticeTimer = setTimeout(() => { notice.value = '' }, 6000)
}

function render() {
  if (!map) return
  cluster.clearLayers()
  markers.clear()
  for (const b of props.businesses) {
    if (typeof b.lat !== 'number' || typeof b.lng !== 'number') continue // 좌표가 없는 업체는 핀을 만들지 않습니다.
    const marker = L.marker([b.lat, b.lng], {
      icon: iconFor(b, b.slug === props.selected),
      title: b.name,
      keyboard: true,
      zIndexOffset: b.slug === props.selected ? 1000 : 0
    })
    marker.on('click', () => emit('select', b.slug))
    markers.set(b.slug, marker)
    cluster.addLayer(marker)
  }
}

function applySelection() {
  if (!map) return
  for (const b of props.businesses) {
    const marker = markers.get(b.slug)
    if (!marker) continue
    const isSelected = b.slug === props.selected
    marker.setIcon(iconFor(b, isSelected))
    marker.setZIndexOffset(isSelected ? 1000 : 0)
  }
  const target = markers.get(props.selected)
  if (!target) return
  // 선택한 업체가 화면 밖이거나 묶음 안에 있을 때만 지도를 움직입니다.
  quiet(900)
  if (cluster.getVisibleParent(target) !== target) {
    cluster.zoomToShowLayer(target, () => {})
  } else if (!map.getBounds().contains(target.getLatLng())) {
    map.panTo(target.getLatLng())
  }
}

function fit() {
  if (!map) return
  render()
  const points = [...markers.values()].map(m => m.getLatLng())
  quiet()
  if (!points.length) {
    map.setView([props.center.lat, props.center.lng], props.center.zoom, { animate: false })
  } else if (points.length === 1) {
    map.setView(points[0], 16, { animate: false })
  } else {
    map.fitBounds(L.latLngBounds(points), { paddingTopLeft: [40, 96], paddingBottomRight: [40, 40], maxZoom: 16, animate: false })
  }
  applySelection()
}

function onMoveEnd() {
  const c = map.getCenter()
  emit('view', { lat: c.lat, lng: c.lng, zoom: map.getZoom() })
  if (Date.now() >= quietUntil) emit('moved')
}

async function init() {
  failed.value = false
  tileLoads = 0
  tileErrors = 0
  try {
    const mod: any = await import('leaflet')
    L = mod.default ?? mod
    ;(window as any).L = L
    await import('leaflet.markercluster')
    if (!el.value) return

    map = L.map(el.value, { zoomControl: false, attributionControl: true, worldCopyJump: true })
    L.control.zoom({ position: 'bottomright', zoomInTitle: '지도 확대', zoomOutTitle: '지도 축소' }).addTo(map)

    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'
    })
    tiles.on('tileload', () => { tileLoads++ })
    tiles.on('tileerror', () => {
      tileErrors++
      // 타일이 하나도 불러와지지 않으면 지도 실패로 보고 목록만 쓸 수 있게 안내합니다.
      if (tileLoads === 0 && tileErrors >= 4) failed.value = true
    })
    tiles.addTo(map)

    // 묶음 마커: 키보드 초점이 가는 바깥 요소에 이름을 붙입니다. (낭독기가 "업체 5곳 묶음"이라고 읽음)
    const ClusterIcon = L.DivIcon.extend({
      createIcon(old: HTMLElement) {
        const icon = L.DivIcon.prototype.createIcon.call(this, old)
        icon.setAttribute('aria-label', (this as any).options.ariaLabel)
        return icon
      }
    })
    cluster = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 50,
      iconCreateFunction: (c: any) => {
        const n = c.getChildCount()
        return new ClusterIcon({ html: `<div aria-hidden="true" data-n="${n}"></div>`, className: 'lm-cluster', iconSize: [44, 44], ariaLabel: `업체 ${n}곳 묶음. 누르면 펼쳐져요` })
      }
    })
    map.addLayer(cluster)
    map.on('moveend', onMoveEnd)

    if (props.initialView) {
      render()
      quiet()
      map.setView([props.initialView.lat, props.initialView.lng], props.initialView.zoom, { animate: false })
      applySelection()
    } else {
      fit()
    }
  } catch (e) {
    console.error('[map] init failed', e)
    failed.value = true
  }
}

function destroy() {
  if (map) {
    map.remove()
    map = null
  }
  markers.clear()
  me = null
}

async function retry() {
  destroy()
  await init()
}

function locate() {
  if (!map) return
  if (!navigator.geolocation) {
    say('이 기기에서는 현재 위치를 사용할 수 없어요.')
    return
  }
  locating.value = true
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      locating.value = false
      const ll = [pos.coords.latitude, pos.coords.longitude]
      if (me) me.remove()
      me = L.marker(ll, { icon: L.divIcon({ className: 'lm-me', html: '<div></div>', iconSize: [44, 44], iconAnchor: [22, 22] }), keyboard: false, interactive: false }).addTo(map)
      quiet(900)
      map.setView(ll, 15, { animate: false })
      emit('located', { lat: pos.coords.latitude, lng: pos.coords.longitude })
    },
    (err) => {
      locating.value = false
      say(err.code === 1
        ? '위치 권한이 없어도 괜찮아요. 지역을 직접 고르고 지도를 움직여 찾을 수 있어요.'
        : '현재 위치를 찾지 못했어요. 지역을 직접 골라 주세요.')
    },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
  )
}

function invalidate() {
  map?.invalidateSize()
}

function getBounds(): [number, number, number, number] | null {
  if (!map) return null
  const b = map.getBounds()
  return [b.getSouth(), b.getWest(), b.getNorth(), b.getEast()]
}

watch(() => props.businesses, render)
watch(() => props.selected, applySelection)
watch(() => props.fitToken, fit)

onMounted(init)
onBeforeUnmount(() => {
  clearTimeout(noticeTimer)
  destroy()
})

defineExpose({ invalidate, getBounds, locate, retry })
</script>

<template>
  <div class="relative h-full w-full">
    <div ref="el" class="h-full w-full" role="application" aria-label="업체 위치 지도" />

    <button
      type="button"
      class="absolute right-3 top-3 z-[500] inline-flex h-11 items-center gap-1.5 rounded-md bg-default pe-4 ps-3 text-[0.875rem] font-bold text-primary shadow-md"
      :aria-busy="locating"
      @click="locate"
    >
      <AppIcon :name="locating ? 'refresh' : 'locate'" class="size-6" :class="locating ? 'animate-spin' : ''" />
      내 위치
    </button>

    <p
      v-if="notice"
      role="status"
      class="absolute inset-x-3 bottom-12 z-[500] rounded-lg bg-inverted px-4 py-3 text-[0.875rem] leading-snug text-white"
    >
      {{ notice }}
    </p>

    <!-- 지도 실패: 업체 목록과 연락 기능은 그대로 쓸 수 있습니다. -->
    <div v-if="failed" class="absolute inset-0 z-[600] grid place-items-center bg-muted p-6 text-center" role="alert">
      <div>
        <AppIcon name="map" class="mx-auto size-8 text-muted" />
        <p class="mt-2 font-bold text-highlighted">
          지도를 불러오지 못했어요
        </p>
        <p class="mt-1 text-[0.875rem] text-muted">
          아래 업체 목록은 그대로 사용할 수 있어요.
        </p>
        <UButton color="primary" variant="solid" size="md" class="mt-3" type="button"  @click="retry">
          지도 다시 불러오기
        </UButton>
      </div>
    </div>
  </div>
</template>
