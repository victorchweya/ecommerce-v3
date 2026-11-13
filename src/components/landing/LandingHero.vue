<script setup lang="ts">
import { RouterLink } from 'vue-router'
import Button from 'primevue/button'
import CompanyContext from '@/components/organization/CompanyContext.vue'
import { useAuthStore } from '@/stores/auth'
const auth = useAuthStore()
</script>
<template>
  <section aria-labelledby="landing-heading" class="grid items-center gap-6 md:grid-cols-2">
    <div class="flex flex-col items-start gap-5 py-4">
      <CompanyContext v-if="auth.token" class="text-sm text-muted-color" />
      <h1 id="landing-heading" class="max-w-[40ch] text-2xl font-semibold">
        Fresh produce for your business
      </h1>
      <p class="max-w-[56ch] text-muted-color">
        Shop fresh produce and wholesale groceries. Choose the grades, units and quantities that
        work for your business.
      </p>
      <div class="flex flex-wrap items-center gap-3">
        <Button
          :as="RouterLink"
          :to="{ name: auth.token ? 'catalog' : 'login' }"
          :label="auth.token ? 'Browse catalog' : 'Sign in to shop'"
          class="min-h-11"
        />
        <Button
          v-if="!auth.token"
          :as="RouterLink"
          to="/auth/register"
          label="Request an account"
          severity="secondary"
          variant="outlined"
          class="min-h-11"
        />
      </div>
    </div>
    <img
      src="/images/landing-produce.png"
      alt="Fresh red onions"
      width="708"
      height="962"
      fetchpriority="high"
      class="hidden h-64 w-full rounded-border object-cover sm:block md:h-72"
    />
  </section>
</template>
