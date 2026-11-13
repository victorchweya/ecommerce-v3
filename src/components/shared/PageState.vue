<script setup lang="ts">
import Button from 'primevue/button'
import { RouterLink } from 'vue-router'

defineProps<{ title: string; description: string }>()
</script>

<template>
  <section
    aria-labelledby="page-heading"
    class="mx-auto flex w-full max-w-xl flex-col items-start gap-4 rounded-border border border-surface p-6"
  >
    <h1 id="page-heading" class="text-2xl font-semibold">{{ title }}</h1>
    <p class="text-muted-color">{{ description }}</p>
    <Button v-slot="slotProps" asChild>
      <RouterLink to="/" :class="slotProps.class">Return home</RouterLink>
    </Button>
  </section>
</template>
