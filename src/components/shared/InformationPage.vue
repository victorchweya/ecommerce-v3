<script setup lang="ts">
import PageBreadcrumb from './PageBreadcrumb.vue'
defineProps<{ title: string }>()
</script>
<template>
  <article class="mx-auto flex max-w-3xl flex-col gap-6">
    <PageBreadcrumb :items="[{ label: title }]" />
    <h1 class="text-2xl font-semibold">{{ title }}</h1>
    <slot />
  </article>
</template>
