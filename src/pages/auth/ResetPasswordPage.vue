<script setup lang="ts">
import { computed } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { RouterLink, useRoute } from 'vue-router'
import Message from 'primevue/message'
import ResetPasswordForm from '@/components/auth/ResetPasswordForm.vue'
import { resetPassword } from '@/api/auth'
import { ApiError } from '@/lib/api'
import { errorMessage } from '@/utils/auth'
import { emailSchema } from '@/validation/auth'
const route = useRoute()
const email = computed(() => (typeof route.query.email === 'string' ? route.query.email : ''))
const token = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''))
const validLink = computed(() => Boolean(token.value) && emailSchema.safeParse(email.value).success)
const { mutate, isPending, error, isSuccess } = useMutation({ mutationFn: resetPassword })
const fieldErrors = computed(() => (error.value instanceof ApiError ? error.value.fieldErrors : {}))
</script>

<template>
  <section aria-labelledby="reset-heading" class="flex w-full flex-col gap-6">
    <h1 id="reset-heading" class="text-2xl font-semibold">Reset password</h1>
    <Message v-if="isSuccess" severity="success"
      >Your password has been reset. You can now sign in.</Message
    >
    <ResetPasswordForm
      v-else-if="validLink"
      :key="token + email"
      :email="email"
      :token="token"
      :pending="isPending"
      :error="error ? errorMessage(error) : ''"
      :field-errors="fieldErrors"
      @submit="mutate"
    />
    <Message v-else severity="error"
      >This reset link is incomplete. Request another link to continue.</Message
    >
    <RouterLink v-if="!isSuccess" :to="{ name: 'forgotPassword' }" class="underline"
      >Request another reset link</RouterLink
    >
    <RouterLink :to="{ name: 'login' }" class="underline">Back to sign in</RouterLink>
  </section>
</template>
