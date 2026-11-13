<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { useCommerceQuery } from '@/composables/shared/useCommerceQuery'
import { useCheckout } from '@/composables/checkout/useCheckout'
import { fetchAddresses } from '@/api/addresses'
import { formatCurrency } from '@/lib/currency'
import QueryStatus from '@/components/shared/QueryStatus.vue'
import CheckoutOrderSummary from './CheckoutOrderSummary.vue'
import CheckoutDetailsForm from './CheckoutDetailsForm.vue'
const {
  company,
  key,
  cart,
  ready,
  products,
  summary,
  lines,
  checkout,
  belongs,
  locked,
  submit,
  checkPayment,
  completePaidOrder,
  now,
} = useCheckout()
const { query: addresses } = useCommerceQuery(
  () => ['addresses'],
  (target, signal) => fetchAddresses(target.token, target.branchId, signal),
)
const selectedProducts = computed(() =>
  lines.value.flatMap((line) => (line.product ? [line.product] : [])),
)
const onlyPartner = computed(
  () =>
    selectedProducts.value.length > 0 &&
    selectedProducts.value.every((product) => product.product_type === 'partner_product'),
)
const hasPartner = computed(() =>
  selectedProducts.value.some((product) => product.product_type === 'partner_product'),
)
const blocked = computed(
  () =>
    !ready.value ||
    products.isFetching.value ||
    products.isError.value ||
    summary.value.hasUnavailable ||
    summary.value.shortfall > 0 ||
    cart.needsRecovery,
)
function forgetResolved() {
  try {
    checkout.forget()
  } catch {
    checkout.error = 'The checkout reference could not be cleared on this device.'
  }
}
</script>
<template>
  <div class="flex flex-col gap-6">
    <Message v-if="checkout.error" severity="error">{{ checkout.error }}</Message>
    <section
      v-if="checkout.reference"
      aria-label="Checkout attempt"
      class="flex flex-col gap-4 border-y border-surface py-5"
    >
      <h2 class="text-xl font-semibold">Checkout attempt</h2>
      <p>
        Estimated attempt amount:
        {{ formatCurrency(checkout.reference.amount) }}
      </p>
      <details v-if="checkout.submission" :open="checkout.submission.review.length <= 5">
        <summary class="cursor-pointer font-semibold">
          Saved order submission · {{ checkout.submission.review.length }} items
        </summary>
        <ul class="max-h-64 overflow-y-auto list-disc pl-5">
          <li v-for="(item, index) in checkout.submission.review" :key="index">{{ item }}</li>
        </ul>
      </details>
      <p v-if="checkout.reference.collectionId">
        Payment reference: {{ checkout.reference.collectionId }}
      </p>
      <p v-if="!belongs">
        This attempt belongs to another company. Return to its selected branch to check it, or
        contact support.
      </p>
      <p v-if="checkout.reference.stage === 'pending'">
        Complete the M-Pesa prompt on your phone, then check the payment status. Do not start a
        second payment while this one is pending.
      </p>
      <p v-else-if="checkout.reference.stage === 'paid'">
        Payment is confirmed.
        {{
          checkout.submission
            ? 'Confirm the saved order submission below.'
            : 'The saved order submission is no longer in this tab. Check your orders and contact support using the payment reference.'
        }}
      </p>
      <p v-else-if="checkout.reference.stage === 'failed'">
        Payment failed. You may review the form and try again.
      </p>
      <Message v-else severity="warn">{{
        checkout.busy
          ? 'Submitting your request…'
          : 'The result is uncertain. Check your orders and contact support before attempting another payment or order.'
      }}</Message>
      <Button
        v-if="checkout.reference.collectionId && belongs"
        label="Check payment status"
        severity="secondary"
        :disabled="checkout.busy"
        :loading="checkout.busy"
        @click="checkPayment"
      />
      <Button
        v-if="checkout.reference.stage === 'paid' && checkout.submission && belongs"
        label="Confirm paid order"
        :disabled="checkout.busy"
        :loading="checkout.busy"
        @click="completePaidOrder"
      />
      <Button
        v-if="checkout.reference.stage === 'failed'"
        label="Review and try again"
        severity="secondary"
        :disabled="checkout.busy"
        @click="forgetResolved"
      />
      <template
        v-if="!checkout.busy && (checkout.reference.stage === 'unknown' || !checkout.submission)"
        ><RouterLink to="/orders" class="underline">Check my orders</RouterLink
        ><RouterLink to="/contact" class="underline">Contact support</RouterLink>
        <details>
          <summary class="cursor-pointer">After support has resolved this attempt</summary>
          <p class="my-3">
            Clear this reference only after confirming whether payment and order creation completed.
          </p>
          <Button
            label="I confirmed this attempt is resolved"
            severity="secondary"
            variant="outlined"
            @click="forgetResolved"
          /></details
      ></template>
    </section>
    <template v-if="cart.count">
      <QueryStatus
        :pending="products.isPending.value"
        :error="products.error.value"
        :fetching="products.isFetching.value"
        @retry="products.refetch()"
      />
      <QueryStatus
        :pending="addresses.isPending.value"
        :error="addresses.error.value"
        :fetching="addresses.isFetching.value"
        @retry="addresses.refetch()"
      />
      <CheckoutDetailsForm
        v-if="company.data.value && addresses.data.value && !addresses.isError.value"
        :key="key"
        :company="company.data.value"
        :addresses="addresses.data.value"
        :only-partner="onlyPartner"
        :has-partner="hasPartner"
        :disabled="blocked || locked"
        :now="now.getTime()"
        @submit="submit"
        ><template #review="{ deliveryFee }"
          ><CheckoutOrderSummary
            v-if="products.isSuccess.value"
            :lines="lines"
            :summary="summary"
            :delivery-fee="deliveryFee" /></template
      ></CheckoutDetailsForm>
    </template>
    <p v-else-if="!checkout.reference">
      Your cart is empty.
      <RouterLink to="/catalog" class="underline">Browse the catalog</RouterLink>.
    </p>
  </div>
</template>
