<script setup lang="ts">
import type { CartLine } from '@/types/cart'
import type { cartSummary } from '@/utils/cart/calculations'
import CartSummary from '@/components/cart/CartSummary.vue'
import CartLineSummary from '@/components/cart/CartLineSummary.vue'
defineProps<{
  lines: CartLine[]
  summary: ReturnType<typeof cartSummary>
  deliveryFee?: number | null
}>()
</script>
<template>
  <div class="flex min-w-0 flex-col gap-5">
    <CartSummary :summary="summary" checkout :delivery-fee="deliveryFee" />
    <section aria-label="Order items" class="flex flex-col gap-3 border-t border-surface pt-4">
      <details :open="lines.length <= 5">
        <summary class="cursor-pointer font-semibold">
          Review {{ lines.length }} {{ lines.length === 1 ? 'item' : 'items' }}
        </summary>
        <ul
          role="list"
          tabindex="0"
          aria-label="Order item list"
          class="mt-3 flex max-h-80 flex-col overflow-y-auto"
        >
          <li
            v-for="line in lines"
            :key="line.key"
            class="border-b border-surface py-3 last:border-0"
          >
            <CartLineSummary :line="line" />
          </li>
        </ul>
      </details>
      <RouterLink to="/cart" class="self-start underline">Edit cart</RouterLink>
    </section>
  </div>
</template>
