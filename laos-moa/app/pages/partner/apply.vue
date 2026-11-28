<script setup lang="ts">
// 협력업체 가입 신청: 일반 회원가입과 별개입니다. 관리자가 확인한 뒤 로그인 ID와 접속 코드를 보내 드립니다.
definePageMeta({ layout: 'admin' })
useSeoMeta({ title: '협력업체 가입 신청 · 라자' })

const categories = ['환전', '골프', '마사지', '오토바이 렌트', '티켓·여행코스', '식당', '기타']

const form = reactive({ company: '', contactName: '', contact: '', category: '', address: '', message: '', website: '' })
const loading = ref(false)
const error = ref('')
const done = ref(false)

const canSubmit = computed(() => form.company.trim() && form.contactName.trim() && form.contact.trim().length >= 2 && form.category)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await $fetch('/api/partner/apply', { method: 'POST', body: { ...form } })
    done.value = true
  } catch (e) {
    error.value = errorMessage(e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UContainer class="flex min-h-[70vh] items-center justify-center py-12">
    <div v-if="done" class="box3d w-full max-w-md border border-default bg-default p-7 text-center">
      <h1 class="text-xl font-extrabold text-highlighted">
        신청이 접수되었어요
      </h1>
      <p class="mt-3 text-sm leading-relaxed text-muted">
        라자가 내용을 확인한 뒤 남겨 주신 연락처로 로그인 ID와 접속 코드를 보내 드려요.
      </p>
      <UButton to="/partner/login" label="협력업체 로그인으로" color="primary" class="mt-5" />
    </div>

    <form v-else class="box3d w-full max-w-md border border-default bg-default p-7" @submit.prevent="submit">
      <h1 class="text-xl font-extrabold text-highlighted">
        협력업체 가입 신청
      </h1>
      <p class="mt-1 text-sm text-muted">
        일반 회원가입과 달라요. 신청하면 라자가 확인한 뒤 협력업체 계정을 만들어 드려요.
      </p>

      <label for="pa-company" class="mt-5 block text-sm font-bold text-highlighted">업체명 <span class="text-primary">*</span></label>
      <UInput id="pa-company" v-model="form.company" size="lg" class="mt-2 w-full" />

      <label for="pa-name" class="mt-4 block text-sm font-bold text-highlighted">담당자 이름 <span class="text-primary">*</span></label>
      <UInput id="pa-name" v-model="form.contactName" size="lg" class="mt-2 w-full" />

      <ContactInput id="pa-contact" v-model="form.contact" label="연락받을 방법" required class="mt-4" />

      <label for="pa-cat" class="mt-4 block text-sm font-bold text-highlighted">업종 <span class="text-primary">*</span></label>
      <select id="pa-cat" v-model="form.category" class="mt-2 w-full border border-default bg-default px-3 py-2.5 text-base">
        <option value="" disabled>
          업종을 선택하세요
        </option>
        <option v-for="c in categories" :key="c" :value="c">
          {{ c }}
        </option>
      </select>

      <label for="pa-address" class="mt-4 block text-sm font-bold text-highlighted">주소 (선택)</label>
      <UInput id="pa-address" v-model="form.address" size="lg" class="mt-2 w-full" />

      <label for="pa-message" class="mt-4 block text-sm font-bold text-highlighted">업체 소개 (선택)</label>
      <UTextarea id="pa-message" v-model="form.message" :rows="4" class="mt-2 w-full" />

      <div class="hidden" aria-hidden="true">
        <input v-model="form.website" type="text" name="website" tabindex="-1" autocomplete="off">
      </div>

      <UAlert v-if="error" class="mt-4" color="error" variant="subtle" icon="i-lucide-circle-alert" :title="error" />

      <UButton type="submit" label="가입 신청하기" color="primary" size="lg" block class="mt-5" :loading="loading" :disabled="!canSubmit" />
      <p class="mt-4 text-center text-sm text-muted">
        이미 계정이 있나요?
        <NuxtLink to="/partner/login" class="font-bold text-primary underline">로그인</NuxtLink>
      </p>
    </form>
  </UContainer>
</template>
