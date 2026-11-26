<script setup lang="ts">
import { CONTACT_TYPES, MAX_CONTACTS, contactProblem, contactTypeMap, parseContacts, serializeContacts } from '../../shared/utils/contact'
import type { ContactItem, ContactType } from '../../shared/utils/contact'

// 관리자용: 업체에 연락 방법을 여러 개 등록합니다. 값은 저장용 글자(JSON)로 주고받습니다.
const props = defineProps<{ modelValue: string, idPrefix: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const items = ref<ContactItem[]>(parseContacts(props.modelValue))
watch(() => props.modelValue, (v) => {
  if (v !== serializeContacts(items.value)) items.value = parseContacts(v)
})

const problems = computed(() => items.value.map(i => (i.value.trim() ? contactProblem(i) : null)))

function push() {
  emit('update:modelValue', serializeContacts(items.value))
}
function add() {
  if (items.value.length >= MAX_CONTACTS) return
  items.value.push({ type: 'kakao' as ContactType, value: '' })
}
function remove(i: number) {
  items.value.splice(i, 1)
  push()
}
</script>

<template>
  <div>
    <ul class="space-y-2">
      <li v-for="(c, i) in items" :key="i">
        <div class="flex items-center gap-2">
          <SnsIcon :type="c.type" class="size-8 shrink-0" />
          <select v-model="c.type" :aria-label="`연락 방법 ${i + 1} 종류`" class="w-28 shrink-0 border border-default bg-white px-2 py-2 text-sm font-bold" @change="push">
            <option v-for="t in CONTACT_TYPES" :key="t.key" :value="t.key">
              {{ t.label }}
            </option>
          </select>
          <input
            :id="`${idPrefix}-${i}`"
            v-model="c.value"
            :aria-label="`연락 방법 ${i + 1} 아이디 또는 번호`"
            class="min-w-0 flex-1 border border-default bg-white px-3 py-2 text-sm"
            :placeholder="contactTypeMap[c.type].placeholder"
            autocomplete="off"
            @input="push"
          >
          <UButton icon="i-lucide-x" color="neutral" variant="outline" size="sm" :aria-label="`연락 방법 ${i + 1} 지우기`" @click="remove(i)" />
        </div>
        <p v-if="problems[i]" class="mt-1 text-xs font-bold text-error">
          {{ problems[i] }}
        </p>
      </li>
    </ul>
    <UButton v-if="items.length < MAX_CONTACTS" type="button" label="연락 방법 추가" icon="i-lucide-plus" color="neutral" variant="outline" size="sm" class="mt-2" @click="add" />
    <p class="mt-1 text-xs text-muted">
      전화·카카오톡·위챗·텔레그램·왓츠앱·라인 중에서 고르세요. 사이트에는 종류별로 표시되고, 옆에 복사 버튼이 생깁니다. (최대 {{ MAX_CONTACTS }}개)
    </p>
  </div>
</template>
