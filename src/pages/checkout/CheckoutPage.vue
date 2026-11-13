<script setup lang="ts">
import PageBreadcrumb from '@/components/shared/PageBreadcrumb.vue'
import CheckoutFlow from '@/components/checkout/CheckoutFlow.vue'
import CompanyContext from '@/components/organization/CompanyContext.vue'
</script>
<template>
  <section class="flex flex-col gap-6">
    <PageBreadcrumb :items="[{ label: 'Checkout' }]" />
    <header class="flex flex-col gap-2">
      <h1 class="text-2xl font-semibold">Checkout</h1>
      <CompanyContext class="text-sm text-muted-color" />
    </header>
    <CheckoutFlow />
  </section>
</template>
