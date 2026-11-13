<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import Button from 'primevue/button'
import Message from 'primevue/message'
import LoginForm from '@/components/auth/LoginForm.vue'
import OtpLoginForm from '@/components/auth/OtpLoginForm.vue'
import { useLogin } from '@/composables/auth/useLogin'
import { useAuthStore } from '@/stores/auth'
import { ApiError } from '@/lib/api'
import { errorMessage } from '@/utils/auth'

const auth = useAuthStore()
const method = ref<'password' | 'code'>('password')
const { mutate, error, isPending, reset } = useLogin()
const message = computed(() => (error.value ? errorMessage(error.value) : ''))
const fieldErrors = computed(() => (error.value instanceof ApiError ? error.value.fieldErrors : {}))
function switchMethod() {
  reset()
  method.value = method.value === 'password' ? 'code' : 'password'
}
</script>

<template>
  <section aria-labelledby="login-heading" class="flex w-full flex-col gap-6">
    <h1 id="login-heading" class="text-2xl font-semibold">Sign in</h1>
    <Message v-if="auth.notice" severity="info">{{ auth.notice }}</Message>
    <LoginForm
      v-if="method === 'password'"
      :pending="isPending"
      :error="message"
      :field-errors="fieldErrors"
      @submit="mutate"
    />
    <OtpLoginForm v-else :pending="isPending" :error="message" @submit="mutate" @clear="reset" />
    <div aria-hidden="true" class="flex items-center gap-3">
      <div class="flex-1 border-t border-surface"></div>
      <span class="text-muted-color">or</span>
      <div class="flex-1 border-t border-surface"></div>
    </div>
    <Button
      :label="method === 'password' ? 'Sign in with a code' : 'Sign in with a password'"
      severity="secondary"
      variant="text"
      :disabled="isPending"
      @click="switchMethod"
    />
    <div class="flex flex-wrap justify-center gap-x-2 gap-y-1">
      <p>New to Farm to Feed?</p>
      <RouterLink :to="{ name: 'register' }" class="underline">Register your business</RouterLink>
    </div>
  </section>
</template>
