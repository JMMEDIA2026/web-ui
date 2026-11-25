<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  size?: string
}>(), {
  title: '배너 광고 자리',
  size: 'PC 970×250 · 모바일 320×100'
})
</script>

<template>
  <aside
    aria-label="광고 영역"
    class="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border-2 border-dashed border-default bg-default p-4"
  >
    <UBadge label="광고" color="neutral" variant="subtle" class="self-start" />
    <div class="flex-1 min-w-0">
      <p class="font-semibold text-highlighted">
        {{ title }}
      </p>
      <p class="text-sm text-muted">
        {{ size }}
      </p>
    </div>
    <UButton to="/advertise#inquiry" label="광고 문의" color="neutral" variant="outline" size="sm" />
  </aside>
</template>
