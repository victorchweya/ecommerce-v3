<script setup lang="ts">
import { useMutation } from '@tanstack/vue-query'
import { RouterLink, useRouter } from 'vue-router'
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm.vue'
import { forgotPassword } from '@/api/auth'
import { errorMessage } from '@/utils/auth'
const router = useRouter()
const { mutate, isPending, error } = useMutation({
  mutationFn: forgotPassword,
  onSuccess: () => router.push({ name: 'passwordResetCheckEmail' }),
})
</script>

<template>
  <section aria-labelledby="recovery-heading" class="flex w-full flex-col gap-6">
    <h1 id="recovery-heading" class="text-2xl font-semibold">Forgot password</h1>
    <p>Enter your email to request a password reset link.</p>
    <ForgotPasswordForm
      :pending="isPending"
      :error="error ? errorMessage(error) : ''"
      @submit="mutate"
    />
    <RouterLink :to="{ name: 'login' }" class="underline">Back to sign in</RouterLink>
  </section>
</template>
