<script setup lang="ts">
import AccountLayout from '@/layouts/AccountLayout.vue'
import DeliveryAddresses from '@/components/account/DeliveryAddresses.vue'
import { useCommerceContext } from '@/composables/shared/useCommerceContext'
const { key } = useCommerceContext()
</script>
<template>
  <AccountLayout
    ><h1 class="text-2xl font-semibold">Delivery addresses</h1>
    <DeliveryAddresses :key="key"
  /></AccountLayout>
</template>
