<script setup lang="ts">
import AppFooter from '@/components/layout/AppFooter.vue'
import AppHeader from '@/components/layout/AppHeader.vue'
</script>

<template>
  <div class="isolate flex min-h-dvh flex-col">
    <a href="#main-content" class="sr-only focus:not-sr-only focus:p-4">Skip to content</a>
    <AppHeader />
    <main
      id="main-content"
      tabindex="-1"
      class="mx-auto w-full max-w-8xl flex-1 px-4 py-10 sm:px-6"
    >
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
