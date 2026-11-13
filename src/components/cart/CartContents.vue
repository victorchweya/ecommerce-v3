<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { RouterLink } from 'vue-router'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { useCart } from '@/composables/cart/useCart'
import { formatCurrency } from '@/lib/currency'
import { errorMessage } from '@/utils/auth'
import type { ProductSelection } from '@/types/catalog'
import type { CartLine } from '@/types/cart'
import { voucherAvailable } from '@/utils/cart/calculations'
import CartItem from './CartItem.vue'
import CartItemEditor from './CartItemEditor.vue'
import CartSummary from './CartSummary.vue'
import VoucherField from './VoucherField.vue'
const {
  cart,
  ready,
  products,
  availableVoucher,
  selectedVoucher,
  voucher,
  lines,
  summary,
  contextKey,
  scopeKey,
  applyVoucher,
  pricing,
  now,
  disabled,
  editingDisabled,
  quantityReset,
  saveQuantity,
} = useCart()
const desktop = useMediaQuery('(min-width: 1024px)')
const canCheckout = computed(
  () =>
    !editingDisabled.value &&
    !summary.value.hasUnavailable &&
    summary.value.shortfall <= 0 &&
    (!cart.voucherCode || Boolean(voucher.value)),
)
const edit = shallowRef<{ key: string; revision: number; split: boolean } | null>(null)
const confirmClear = shallowRef(false)
watch(contextKey, () => {
  edit.value = null
  confirmClear.value = false
})
const voucherError = computed(() =>
  selectedVoucher.isError.value && cart.voucherCode
    ? errorMessage(selectedVoucher.error.value)
    : cart.voucherCode &&
        selectedVoucher.isSuccess.value &&
        !selectedVoucher.isFetching.value &&
        !voucher.value
      ? 'This voucher has expired or is no longer available.'
      : '',
)
const suggestedVoucher = computed(() =>
  voucherAvailable(availableVoucher.data.value, now.value.getTime())
    ? (availableVoucher.data.value ?? null)
    : null,
)
function openEditor(line: CartLine, split: boolean) {
  edit.value = { key: line.key, revision: cart.revision, split }
}
function save(line: CartLine, selection: ProductSelection) {
  if (!edit.value || !line.product || editingDisabled.value) return
  cart.apply(selection, line.product, edit.value)
}
</script>
<template>
  <div class="@container flex flex-col gap-5" :class="{ 'pb-32 lg:pb-0': cart.count > 0 }">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <RouterLink :to="{ name: 'catalog' }" class="underline">Continue shopping</RouterLink>
      <div v-if="cart.count" class="flex items-center gap-4">
        <p>{{ cart.count }} {{ cart.count === 1 ? 'item' : 'items' }}</p>
        <a href="#cart-summary" class="underline">Review totals</a>
      </div>
    </div>
    <Message v-if="cart.error" severity="error">{{ cart.error }}</Message>
    <p v-if="cart.notice" role="status">{{ cart.notice }}</p>
    <div v-if="cart.needsRecovery || cart.error" class="flex flex-wrap gap-3">
      <Button label="Reload saved cart" severity="secondary" @click="cart.reload()" />
      <Button
        v-if="cart.needsRecovery"
        label="Reset saved cart"
        severity="danger"
        variant="outlined"
        @click="cart.resetSaved()"
      />
    </div>
    <template v-if="ready">
      <template v-if="!cart.count && !cart.needsRecovery">
        <h2 class="text-xl font-semibold">Your cart is empty</h2>
        <p class="text-muted-color">Choose a product and its options to start your cart.</p>
      </template>
      <template v-else-if="cart.count">
        <p v-if="products.isFetching.value" role="status">
          {{ products.isPending.value ? 'Loading cart products…' : 'Refreshing cart prices…' }}
        </p>
        <template v-if="products.isError.value">
          <Message severity="error"
            >{{ errorMessage(products.error.value) }} Your saved selections are retained.</Message
          >
          <Button
            label="Retry cart products"
            severity="secondary"
            class="self-start"
            :disabled="products.isFetching.value"
            @click="products.refetch()"
          />
        </template>
        <div class="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div class="flex min-w-0 flex-col gap-5">
            <div
              aria-hidden="true"
              class="hidden grid-cols-[minmax(0,1fr)_7rem_8rem_5rem] gap-4 border-b border-surface pb-3 text-sm text-muted-color lg:grid"
            >
              <p>Product and options</p>
              <p>Quantity</p>
              <p class="text-right">Line estimate</p>
              <span />
            </div>
            <ul
              v-if="!products.isPending.value"
              aria-label="Cart items"
              role="list"
              class="flex flex-col"
            >
              <li v-for="line in lines" :key="line.key">
                <CartItem
                  :line="line"
                  :disabled="disabled"
                  :editing="edit?.key === line.key || editingDisabled"
                  :revision="cart.revision"
                  :scope-key="scopeKey"
                  :quantity-reset="quantityReset"
                  @edit="openEditor(line, false)"
                  @split="openEditor(line, true)"
                  @remove="cart.remove(line.key)"
                  @quantity="(value, context) => saveQuantity(line, value, context)"
                >
                  <CartItemEditor
                    v-if="edit?.key === line.key"
                    :key="contextKey"
                    :line="line"
                    :split="edit.split"
                    :pricing="pricing"
                    :now="now.getTime()"
                    :disabled="editingDisabled"
                    @save="save(line, $event)"
                    @cancel="edit = null"
                  />
                </CartItem>
              </li>
            </ul>
            <div class="flex flex-col items-start gap-3">
              <Button
                v-if="!confirmClear"
                label="Clear cart"
                severity="danger"
                variant="outlined"
                :disabled="disabled"
                @click="confirmClear = true"
              />
              <template v-else>
                <p>Remove all items from your cart?</p>
                <div class="flex flex-wrap gap-3">
                  <Button
                    label="Yes, clear cart"
                    severity="danger"
                    :disabled="disabled"
                    @click="cart.clear()"
                  />
                  <Button label="Keep cart" severity="secondary" @click="confirmClear = false" />
                </div>
              </template>
            </div>
          </div>
          <aside
            v-if="products.isSuccess.value && !products.isError.value"
            id="cart-summary"
            aria-label="Order summary"
            class="flex min-w-0 flex-col gap-5 lg:sticky lg:top-6 lg:border-l lg:border-surface lg:pl-8"
          >
            <CartSummary :summary="summary" />
            <Button
              v-if="desktop && canCheckout"
              :as="RouterLink"
              :to="{ name: 'checkout' }"
              class="w-full min-h-11"
              label="Proceed to checkout"
            />
            <details
              :open="Boolean(cart.voucherCode || voucherError)"
              class="border-t border-surface pt-4"
            >
              <summary class="cursor-pointer">Have a voucher?</summary>
              <div class="pt-4">
                <VoucherField
                  :selected="cart.voucherCode"
                  :available="suggestedVoucher"
                  :pending="Boolean(cart.voucherCode) && selectedVoucher.isFetching.value"
                  :discovery-error="availableVoucher.isError.value"
                  :error="voucherError"
                  :disabled="editingDisabled || summary.hasUnavailable"
                  :validated="Boolean(voucher)"
                  @apply="applyVoucher"
                  @remove="cart.selectVoucher(null)"
                  @retry="availableVoucher.refetch()"
                />
              </div>
            </details>
          </aside>
        </div>
        <div
          v-if="!desktop && products.isSuccess.value && !products.isError.value"
          aria-label="Cart checkout actions"
          class="fixed inset-x-0 bottom-0 z-20 border-t border-surface bg-surface-0 p-4 dark:bg-surface-950 print:hidden"
        >
          <div class="mx-auto flex w-full max-w-8xl flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-sm text-muted-color">{{ cart.count }} items · Products estimate</p>
              <p class="font-semibold">{{ formatCurrency(summary.total) }}</p>
            </div>
            <Button
              v-if="canCheckout"
              :as="RouterLink"
              :to="{ name: 'checkout' }"
              label="Proceed to checkout"
              class="min-h-11"
            />
            <a v-else href="#cart-summary" class="underline">Review cart to continue</a>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>
