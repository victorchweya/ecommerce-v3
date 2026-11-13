<script setup lang="ts">
import Button from 'primevue/button'
import Message from 'primevue/message'
import { useCart } from '@/composables/cart/useCart'
import QueryStatus from '@/components/shared/QueryStatus.vue'
import CartItem from './CartItem.vue'
import { formatCurrency } from '@/lib/currency'
const {
  cart,
  products,
  lines,
  summary,
  disabled,
  editingDisabled,
  scopeKey,
  quantityReset,
  saveQuantity,
} = useCart()
</script>
<template>
  <div class="flex flex-col gap-5">
    <p>{{ cart.count }} {{ cart.count === 1 ? 'item' : 'items' }} in your cart</p>
    <QueryStatus
      v-if="cart.count"
      :pending="products.isPending.value"
      :error="products.error.value"
      @retry="products.refetch()"
    />
    <Message v-if="cart.error" severity="error">{{ cart.error }}</Message>
    <p v-if="cart.notice" role="status">{{ cart.notice }}</p>
    <p v-if="!cart.count && !cart.needsRecovery">
      Your cart is empty. Choose products from the catalog to start an order.
    </p>
    <ul
      v-if="cart.count && !products.isPending.value"
      aria-label="Cart preview items"
      role="list"
      class="flex flex-col"
    >
      <li v-for="line in lines.slice(0, 5)" :key="line.key">
        <CartItem
          :line="line"
          :disabled="disabled"
          :editing="editingDisabled"
          :revision="cart.revision"
          :scope-key="scopeKey"
          :quantity-reset="quantityReset"
          compact
          @quantity="(value, context) => saveQuantity(line, value, context)"
          @remove="cart.remove(line.key)"
        />
      </li>
    </ul>
    <p v-if="lines.length > 5" class="text-sm text-muted-color">
      {{ lines.length - 5 }} more items in your full cart.
    </p>
    <div
      v-if="products.isSuccess.value && cart.count"
      class="flex justify-between gap-4 border-t border-surface pt-4"
    >
      <span>Estimated products total</span><strong>{{ formatCurrency(summary.total) }}</strong>
    </div>
    <Button v-slot="slotProps" asChild
      ><RouterLink to="/cart" :class="slotProps.class">View full cart</RouterLink></Button
    >
    <RouterLink to="/catalog" class="self-start underline">Continue shopping</RouterLink>
  </div>
</template>
