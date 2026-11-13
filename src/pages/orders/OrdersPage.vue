<script setup lang="ts">
import AccountLayout from '@/layouts/AccountLayout.vue'
import OrdersList from '@/components/orders/OrdersList.vue'
</script>
<template>
  <AccountLayout>
    <section class="flex min-w-0 flex-col gap-6">
      <h1 class="text-2xl font-semibold">Orders</h1>
      <OrdersList />
    </section>
  </AccountLayout>
</template>
