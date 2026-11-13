<script setup lang="ts">
import ChevronRight from '@primeicons/vue/chevron-right'
defineProps<{ items: { label: string; to?: string }[] }>()
</script>
<template>
  <nav aria-label="Breadcrumb" class="print:hidden">
    <ol class="flex flex-wrap items-center gap-2 text-sm">
      <li><RouterLink to="/" class="underline">Home</RouterLink></li>
      <li v-for="(item, index) in items" :key="index" class="flex min-w-0 items-center gap-2">
        <ChevronRight aria-hidden="true" :size="14" class="shrink-0" />
        <RouterLink v-if="item.to" :to="item.to" class="underline">{{ item.label }}</RouterLink>
        <span v-else aria-current="page">{{ item.label }}</span>
      </li>
    </ol>
  </nav>
</template>
