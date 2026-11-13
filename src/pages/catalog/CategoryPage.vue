<script setup lang="ts">
import CatalogBrowser from '@/components/catalog/CatalogBrowser.vue'
defineProps<{ categoryId: string }>()
</script>
<template><CatalogBrowser mode="category" :category-id="categoryId" /></template>
