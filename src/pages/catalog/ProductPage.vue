<script setup lang="ts">
import ProductDetails from '@/components/catalog/ProductDetails.vue'
defineProps<{ productId: string }>()
</script>
<template><ProductDetails :product-id="productId" /></template>
