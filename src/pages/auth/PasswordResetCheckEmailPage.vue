<script setup lang="ts">
import { RouterLink } from 'vue-router'
import Envelope from '@primeicons/vue/envelope'
</script>
<template>
  <section
    aria-labelledby="check-email-heading"
    class="flex w-full flex-col items-center gap-6 text-center"
  >
    <Envelope class="size-8" aria-hidden="true" />
    <h1 id="check-email-heading" class="text-2xl font-semibold">Check your email</h1>
    <p>
      If your account is eligible, you will receive a password reset link. Check your spam folder
      too.
    </p>
    <RouterLink :to="{ name: 'forgotPassword' }" class="underline">Request another link</RouterLink>
    <RouterLink :to="{ name: 'login' }" class="underline">Back to sign in</RouterLink>
  </section>
</template>
