<script setup lang="ts">
import { CONTACT_TYPES, contactTypeMap, decodeContactLine, encodeContactLine } from '../../shared/utils/contact'
import type { ContactType } from '../../shared/utils/contact'

// 연락 방법(카카오톡·위챗·텔레그램·왓츠앱·전화…)을 고르고 아이디(번호)를 입력합니다.
// 값은 "카카오톡: 아이디" 같은 한 줄 글자로 주고받습니다. (전화는 번호만)
const props = defineProps<{ modelValue: string, id: string, label: string, required?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const initial = decodeContactLine(props.modelValue)
const type = ref<ContactType>(initial.type)
const value = ref(initial.value)

function push() {
  emit('update:modelValue', encodeContactLine({ type: type.value, value: value.value }))
}

// 바깥에서 값이 바뀌면(예: 회원 번호 자동 입력) 화면도 따라갑니다.
watch(() => props.modelValue, (v) => {
  if (v === encodeContactLine({ type: type.value, value: value.value })) return
  const d = decodeContactLine(v)
  type.value = d.type
  value.value = d.value
})

const info = computed(() => contactTypeMap[type.value])
</script>

<template>
  <div>
    <label :for="id" class="text-[0.9375rem] font-bold text-ink">{{ label }} <span v-if="required" class="text-brand-600">*</span></label>
    <div class="mt-1.5 flex gap-2">
      <select v-model="type" :aria-label="`${label} 종류`" class="field !w-[7.5rem] shrink-0 !px-3 font-bold" @change="push">
        <option v-for="t in CONTACT_TYPES" :key="t.key" :value="t.key">
          {{ t.label }}
        </option>
      </select>
      <input
        :id="id"
        v-model="value"
        class="field min-w-0 flex-1"
        :inputmode="type === 'phone' || type === 'whatsapp' ? 'tel' : 'text'"
        autocomplete="off"
        autocapitalize="off"
        :placeholder="info.placeholder"
        @input="push"
      >
    </div>
  </div>
</template>
