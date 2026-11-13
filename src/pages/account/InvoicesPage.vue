<script setup lang="ts">
import AccountLayout from '@/layouts/AccountLayout.vue'
import OrdersList from '@/components/orders/OrdersList.vue'
</script>
<template>
  <AccountLayout
    ><h1 class="text-2xl font-semibold">Invoices</h1>
    <OrdersList invoices
  /></AccountLayout>
</template>
