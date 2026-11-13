<script setup lang="ts">
import Shop from '@primeicons/vue/shop'
</script>

<template>
  <RouterLink to="/" class="inline-flex items-center gap-2 font-semibold sm:gap-3">
    <span
      class="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-contrast"
      aria-hidden="true"
    >
      <Shop class="size-5" />
    </span>
    <span>Storefront</span>
  </RouterLink>
</template>
