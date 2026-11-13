<script setup lang="ts">
import { useTemplateRef } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { RouterLink } from 'vue-router'
import Message from 'primevue/message'
import RegistrationForm from '@/components/auth/RegistrationForm.vue'
import { register } from '@/api/auth'
import { apiFieldErrors, errorMessage } from '@/utils/auth'
const heading = useTemplateRef<HTMLHeadingElement>('heading')
const { mutate, error, isPending, isSuccess } = useMutation({
  mutationFn: register,
  gcTime: 0,
  onSuccess: () => heading.value?.focus(),
})
</script>
<template>
  <section aria-labelledby="register-heading" class="flex w-full flex-col gap-6">
    <h1 id="register-heading" ref="heading" tabindex="-1" class="text-2xl font-semibold">
      Register your business
    </h1>
    <template v-if="isSuccess">
      <Message severity="success"
        >Registration request received. Our team will contact you to complete your account
        setup.</Message
      >
      <p>You can sign in once your account is ready.</p>
    </template>
    <template v-else>
      <p>Tell us about your business and our team will help you get started.</p>
      <RegistrationForm
        :pending="isPending"
        :error="error ? errorMessage(error) : ''"
        :field-errors="apiFieldErrors(error)"
        @submit="mutate"
      />
    </template>
    <RouterLink :to="{ name: 'login' }" class="underline">Back to sign in</RouterLink>
  </section>
</template>
