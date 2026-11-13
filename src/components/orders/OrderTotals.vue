<script setup lang="ts">
import type { Order } from '@/types/orders'
import { formatCurrency } from '@/lib/currency'
defineProps<{ order: Order }>()
</script>
<template>
  <dl class="ml-auto flex w-full max-w-md flex-col gap-3 tabular-nums">
    <div v-if="order.sub_total != null" class="flex justify-between gap-4">
      <dt>Subtotal</dt>
      <dd>{{ formatCurrency(order.sub_total) }}</dd>
    </div>
    <div v-if="order.discount_amount" class="flex justify-between gap-4">
      <dt>Discount</dt>
      <dd>{{ formatCurrency(order.discount_amount) }}</dd>
    </div>
    <div class="flex justify-between gap-4">
      <dt>Delivery</dt>
      <dd>
        {{ order.shipping_cost == null ? 'Not available' : formatCurrency(order.shipping_cost) }}
      </dd>
    </div>
    <div v-if="order.total_tax != null" class="flex justify-between gap-4">
      <dt>Included VAT</dt>
      <dd>{{ formatCurrency(order.total_tax) }}</dd>
    </div>
    <div class="flex justify-between gap-4 border-t border-surface pt-3 font-semibold">
      <dt>Total</dt>
      <dd>{{ formatCurrency(order.total_amount) }}</dd>
    </div>
  </dl>
</template>
