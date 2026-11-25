<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  size?: string
}>(), {
  title: '여기에 업체 광고를 게재하세요',
  size: 'PC 970×250 · 모바일 320×100'
})
</script>

<template>
  <aside
    aria-label="광고 영역"
    class="flex flex-col gap-4 rounded-lg border-2 border-dashed border-accented bg-white/70 p-5 sm:flex-row sm:items-center"
  >
    <div class="flex size-12 shrink-0 items-center justify-center bg-tone-sun text-amber-700">
      <UIcon name="i-lucide-megaphone" class="size-6" />
    </div>
    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-2">
        <UBadge label="광고" color="neutral" variant="subtle" />
        <p class="font-bold text-highlighted">
          {{ title }}
        </p>
      </div>
      <p class="mt-1 text-sm text-muted">
        {{ size }}
      </p>
    </div>
    <UButton to="/advertise#inquiry" label="광고 문의하기" color="neutral" variant="outline" trailing-icon="i-lucide-arrow-right" />
  </aside>
</template>
