<script setup lang="ts">
import { useId } from 'vue'
import Message from 'primevue/message'
import type { cartSummary } from '@/utils/cart/calculations'
import { formatCurrency } from '@/lib/currency'
const headingId = useId()
defineProps<{
  summary: ReturnType<typeof cartSummary>
  checkout?: boolean
  deliveryFee?: number | null
}>()
</script>
<template>
  <section :aria-labelledby="headingId" class="flex flex-col gap-4">
    <h2 :id="headingId" class="text-xl font-semibold">
      {{ checkout ? 'Order summary' : 'Cart summary' }}
    </h2>
    <dl class="flex flex-col gap-3 tabular-nums">
      <div class="flex justify-between gap-4">
        <dt>{{ summary.hasUnavailable ? 'Available items subtotal' : 'Products subtotal' }}</dt>
        <dd>{{ formatCurrency(summary.subtotal) }}</dd>
      </div>
      <div v-if="checkout" class="flex justify-between gap-4">
        <dt>Delivery per order</dt>
        <dd class="text-right">
          {{ deliveryFee == null ? 'Choose an address' : formatCurrency(deliveryFee) }}
        </dd>
      </div>
      <div v-if="summary.discount" class="flex justify-between gap-4">
        <dt>Estimated voucher savings</dt>
        <dd>−{{ formatCurrency(summary.discount) }}</dd>
      </div>
      <div v-if="summary.includedTax" class="flex justify-between gap-4 text-sm text-muted-color">
        <dt>VAT included (before voucher)</dt>
        <dd>{{ formatCurrency(summary.includedTax) }}</dd>
      </div>
      <div class="flex justify-between gap-4 border-t border-surface pt-3 font-semibold">
        <dt>
          {{ summary.hasUnavailable ? 'Available items estimate' : 'Estimated products total' }}
        </dt>
        <dd>{{ formatCurrency(summary.total) }}</dd>
      </div>
    </dl>
    <p class="text-sm text-muted-color">
      Selling prices include VAT where applicable.
      <template v-if="checkout"
        >The products estimate excludes delivery. Separate orders may each incur a delivery charge.
        Final totals appear on the created orders.</template
      >
      <template v-else
        >Delivery is calculated at checkout. Prices and voucher eligibility are confirmed when
        ordering.</template
      >
    </p>
    <Message v-if="summary.hasUnavailable" severity="warn"
      >Review or remove unavailable items before ordering.</Message
    >
    <Message v-else-if="summary.shortfall > 0" severity="info"
      >Add {{ formatCurrency(summary.shortfall) }} to reach the minimum basket of
      {{ formatCurrency(summary.minimum) }}.</Message
    >
  </section>
</template>
