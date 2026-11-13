<script setup lang="ts">
import PageBreadcrumb from '@/components/shared/PageBreadcrumb.vue'
import CartContents from '@/components/cart/CartContents.vue'
import CompanyContext from '@/components/organization/CompanyContext.vue'
</script>
<template>
  <section aria-labelledby="cart-heading" class="flex min-w-0 flex-col gap-5">
    <PageBreadcrumb :items="[{ label: 'Cart' }]" />
    <header class="flex flex-col gap-2">
      <h1 id="cart-heading" class="text-2xl font-semibold">Your cart</h1>
      <CompanyContext class="text-sm text-muted-color" />
    </header>
    <CartContents />
  </section>
</template>
