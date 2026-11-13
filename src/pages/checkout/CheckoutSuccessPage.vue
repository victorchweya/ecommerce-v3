<script setup lang="ts">
import { computed } from 'vue'
import { useCommerceContext } from '@/composables/shared/useCommerceContext'
import CheckCircle from '@primeicons/vue/check-circle'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { useCartStore } from '@/stores/cart'
import { useCheckoutStore } from '@/stores/checkout'
import { formatCurrency } from '@/lib/currency'
const checkout = useCheckoutStore()
const cart = useCartStore()
const { company } = useCommerceContext()
const orders = computed(() =>
  checkout.orders.filter((order) => order.company_id === company.data.value?.id),
)
</script>
<template>
  <section
    class="mx-auto flex max-w-3xl flex-col gap-5 rounded-border border border-surface p-5 sm:p-6"
  >
    <CheckCircle v-if="orders.length" aria-hidden="true" :size="32" />
    <h1 class="text-2xl font-semibold">
      {{ orders.length ? 'Order confirmed' : 'Order confirmation' }}
    </h1>
    <p v-if="!orders.length">Open your orders to find your latest confirmation.</p>
    <p v-else>
      {{ orders.length }} order{{ orders.length === 1 ? '' : 's' }} created. Each order has its own
      delivery details and total.
    </p>
    <Message v-if="cart.error" severity="warn"
      >Your order was confirmed, but the local cart could not be cleared. Review it before ordering
      again.</Message
    >
    <ul class="flex flex-col gap-3">
      <li
        v-for="order in orders"
        :key="order.id"
        class="flex flex-wrap justify-between gap-3 rounded-border border border-surface p-4"
      >
        <RouterLink :to="`/orders/${order.id}`" class="underline">{{
          order.order_number
        }}</RouterLink>
        · {{ formatCurrency(order.total_amount) }}
      </li>
    </ul>
    <Button v-slot="slotProps" asChild class="self-start"
      ><RouterLink to="/orders" :class="slotProps.class">View orders</RouterLink></Button
    ><RouterLink to="/catalog" class="underline">Continue shopping</RouterLink>
  </section>
</template>
