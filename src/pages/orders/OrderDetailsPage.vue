<script setup lang="ts">
import AccountLayout from '@/layouts/AccountLayout.vue'
import OrderDetails from '@/components/orders/OrderDetails.vue'
</script>
<template>
  <AccountLayout>
    <section class="flex min-w-0 flex-col gap-6">
      <h1 class="text-2xl font-semibold">Order details</h1>
      <OrderDetails />
    </section>
  </AccountLayout>
</template>
