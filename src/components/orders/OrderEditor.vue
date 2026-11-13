<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import Message from 'primevue/message'
import type { Order, OrderInput } from '@/types/orders'
import type { ProductSelection } from '@/types/catalog'
import { useCatalog } from '@/composables/catalog/useCatalog'
import { useCommerceQuery } from '@/composables/shared/useCommerceQuery'
import { useCommerceMutation } from '@/composables/shared/useCommerceMutation'
import { fetchAddresses } from '@/api/addresses'
import { editOrder } from '@/api/orders'
import { reorderSelections } from '@/utils/orders/selections'
import {
  canEditOrder,
  deliveryIssue,
  deliverySlots,
  checkoutConfiguration,
  orderProducts,
} from '@/utils/checkout/rules'
import { lineIdentity } from '@/utils/cart/line-identity'
import { resolveSelection, additionIssue } from '@/validation/cart'
import { calculateCart } from '@/utils/cart/calculations'
import CartLineSummary from '@/components/cart/CartLineSummary.vue'
import ProductConfigurator from '@/components/catalog/ProductConfigurator.vue'
import QueryStatus from '@/components/shared/QueryStatus.vue'
const props = defineProps<{ order: Order }>()
const router = useRouter()
const { products, pricing, now } = useCatalog()
const { query: addresses, company } = useCommerceQuery(
  () => ['addresses'],
  (target, signal) => fetchAddresses(target.token, target.branchId, signal),
)
const original = computed(() =>
  reorderSelections(props.order.order_line_items, products.data.value ?? [], now.value.getTime()),
)
const items = shallowRef<ProductSelection[] | null>(null)
const selections = computed(() => items.value ?? original.value.items)
const unresolved = ref(false)
const editing = shallowRef<ProductSelection | null>(null)
const adding = ref<number | null>(null)
const error = ref('')
const date = ref(props.order.delivery_date?.slice(0, 10) ?? '')
const slot = ref(props.order.delivery_slot ?? '')
const addressId = ref(props.order.delivery_address_id ?? null)
const notes = ref(props.order.delivery_notes ?? '')
const mutation = useCommerceMutation(
  (target, input: OrderInput) => editOrder(target, props.order.id, input),
  () => router.push(`/orders/${props.order.id}`).then(() => {}),
)
const lines = computed(() =>
  calculateCart(selections.value, products.data.value ?? [], pricing.value, now.value.getTime()),
)
const activeProduct = computed(() =>
  products.data.value?.find((product) => product.id === (editing.value?.productId ?? adding.value)),
)
const originalPartnerId = computed(
  () =>
    products.data.value?.find((product) =>
      props.order.order_line_items.some((line) =>
        product.variations.some((grade) =>
          grade.unit_variants.some((unit) => unit.id === line.product_unit_variant_id),
        ),
      ),
    )?.partner_id,
)
function allowedProduct(product: NonNullable<typeof products.data.value>[number]) {
  if (company.data.value && checkoutConfiguration(company.data.value).options?.consolidate_invoice)
    return true
  return props.order.order_type === 'partner_order'
    ? product.product_type === 'partner_product' && product.partner_id === originalPartnerId.value
    : product.product_type !== 'partner_product'
}
const choices = computed(() =>
  (products.data.value ?? [])
    .filter(
      (product) => product.status === 'active' && product.published && allowedProduct(product),
    )
    .map((product) => ({ id: product.id, name: product.name })),
)
const slots = computed(() =>
  company.data.value
    ? props.order.order_type === 'partner_order'
      ? [props.order.delivery_slot ?? '12:00-14:00']
      : deliverySlots(
          date.value,
          props.order.delivery_type ?? 'Delivery',
          company.data.value,
          false,
          now.value.getTime(),
        )
    : [],
)
function configure(selection: ProductSelection) {
  editing.value = selection
  adding.value = null
}
function closeConfiguration() {
  editing.value = null
  adding.value = null
}
function saveSelection(selection: ProductSelection) {
  const product = products.data.value?.find((product) => product.id === selection.productId)
  if (!product || resolveSelection(selection, product).issue) return
  const next = selections.value.filter(
    (item) => !editing.value || lineIdentity(item) !== lineIdentity(editing.value),
  )
  const index = next.findIndex((item) => lineIdentity(item) === lineIdentity(selection))
  if (index < 0) next.push(selection)
  else
    next[index] = {
      ...selection,
      quantity: Math.round((selection.quantity + next[index]!.quantity) * 100) / 100,
    }
  items.value = next
  editing.value = null
  adding.value = null
}
function save() {
  error.value = ''
  if (
    !canEditOrder(props.order, now.value.getTime()) ||
    !company.data.value ||
    products.isError.value ||
    products.isFetching.value
  )
    return
  if (
    !selections.value.length ||
    lines.value.some((line) => line.issue) ||
    (original.value.skipped.length && !unresolved.value)
  ) {
    error.value = 'Resolve unavailable selections and review quantities before saving.'
    return
  }
  const issue =
    deliveryIssue(date.value, company.data.value, now.value.getTime()) ||
    lines.value
      .map((line) =>
        line.product ? additionIssue(line.product, now.value.getTime()) : 'Unavailable product',
      )
      .find(Boolean)
  if (issue) {
    error.value = issue
    return
  }
  if (
    !slot.value.trim() ||
    !addressId.value ||
    !addresses.data.value?.some((address) => address.id === addressId.value)
  ) {
    error.value = 'Choose an available delivery address and window.'
    return
  }
  if (!['credit', 'cash_on_delivery', 'online'].includes(props.order.payment_type ?? '')) {
    error.value = 'This payment method cannot be edited.'
    return
  }
  mutation.save({
    delivery_type: props.order.delivery_type as OrderInput['delivery_type'],
    payment_type: props.order.payment_type as OrderInput['payment_type'],
    delivery_date: date.value,
    delivery_slot: slot.value,
    delivery_address_id: addressId.value,
    delivery_notes: notes.value,
    products: orderProducts(selections.value),
  })
}
</script>
<template>
  <div class="flex min-w-0 flex-col gap-6">
    <QueryStatus
      :pending="products.isPending.value"
      :error="products.error.value"
      :fetching="products.isFetching.value"
      @retry="products.refetch()"
    />
    <template v-if="products.isSuccess.value">
      <Message v-if="original.skipped.length && !unresolved" severity="warn"
        >Some original selections cannot be reconstructed safely.</Message
      >
      <ul v-if="original.skipped.length" class="list-disc pl-5">
        <li v-for="message in original.skipped" :key="message">{{ message }}</li>
      </ul>
      <Button
        v-if="original.skipped.length && !unresolved"
        label="Remove unavailable original selections"
        severity="secondary"
        class="self-start"
        @click="unresolved = true"
      />
      <section class="flex min-w-0 flex-col gap-4" aria-label="Order item changes">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-xl font-semibold">Order items</h2>
          <p class="text-sm text-muted-color">{{ lines.length }} items</p>
        </div>
        <ul role="list" class="flex min-w-0 flex-col">
          <li
            v-for="line in lines"
            :key="line.key"
            class="flex flex-col items-stretch gap-3 border-b border-surface py-4 sm:flex-row sm:items-center"
          >
            <CartLineSummary :line="line" class="min-w-0 sm:flex-1" />
            <div class="flex flex-wrap gap-2">
              <Button
                label="Configure item"
                severity="secondary"
                variant="outlined"
                size="small"
                :disabled="mutation.feedback.value.pending"
                @click="configure(line.selection)"
              />
              <Button
                label="Remove item"
                severity="danger"
                variant="text"
                size="small"
                :disabled="mutation.feedback.value.pending"
                @click="items = selections.filter((item) => lineIdentity(item) !== line.key)"
              />
            </div>
            <Message v-if="line.issue" severity="warn" class="w-full">{{ line.issue }}</Message>
          </li>
        </ul>
        <div class="flex max-w-md flex-col gap-2">
          <label id="edit-add-label" for="edit-add">Add a product</label>
          <Select
            inputId="edit-add"
            name="add_product"
            ariaLabelledby="edit-add-label"
            v-model="adding"
            :options="choices"
            optionLabel="name"
            optionValue="id"
            filter
            :disabled="mutation.feedback.value.pending"
            @change="editing = null"
          />
        </div>
        <section v-if="activeProduct" class="flex flex-col gap-4 border-y border-surface py-5">
          <h3 class="font-semibold">Configure {{ activeProduct.name }}</h3>
          <ProductConfigurator
            :key="`${editing ? lineIdentity(editing) : adding}`"
            :product="activeProduct"
            :initial-selection="editing ?? undefined"
            :pricing="pricing"
            :now="now.getTime()"
            :disabled="mutation.feedback.value.pending"
            action-label="Save order item"
            @confirm="saveSelection"
          />
          <Button
            label="Close item configuration"
            severity="secondary"
            variant="text"
            class="self-start"
            @click="closeConfiguration"
          />
        </section>
      </section>
      <QueryStatus
        :pending="addresses.isPending.value"
        :error="addresses.error.value"
        @retry="addresses.refetch()"
      />
      <form class="grid gap-4 border-t border-surface pt-6 sm:grid-cols-2" @submit.prevent="save">
        <h2 class="text-xl font-semibold sm:col-span-2">Delivery details</h2>
        <div class="flex min-w-0 flex-col gap-2">
          <label for="edit-date">Delivery date</label>
          <InputText
            id="edit-date"
            name="delivery_date"
            v-model="date"
            type="date"
            required
            :disabled="mutation.feedback.value.pending"
          />
        </div>
        <div class="flex min-w-0 flex-col gap-2">
          <label id="edit-slot-label" for="edit-slot">Delivery window</label>
          <Select
            inputId="edit-slot"
            name="delivery_slot"
            ariaLabelledby="edit-slot-label"
            v-model="slot"
            :options="slots"
            :disabled="mutation.feedback.value.pending || order.order_type === 'partner_order'"
          />
        </div>
        <div class="flex min-w-0 flex-col gap-2 sm:col-span-2">
          <label id="edit-address-label" for="edit-address">Delivery or pickup address</label>
          <Select
            inputId="edit-address"
            name="delivery_address_id"
            ariaLabelledby="edit-address-label"
            v-model="addressId"
            :options="
              (addresses.data.value ?? []).filter((address) =>
                order.delivery_type === 'Delivery'
                  ? address.address_type !== 'pickup'
                  : address.address_type === 'pickup',
              )
            "
            optionLabel="name"
            optionValue="id"
            :disabled="mutation.feedback.value.pending"
          />
        </div>
        <div class="flex min-w-0 flex-col gap-2 sm:col-span-2">
          <label for="edit-notes">Delivery notes</label>
          <Textarea
            id="edit-notes"
            name="delivery_notes"
            v-model="notes"
            :maxlength="2000"
            rows="3"
            :disabled="mutation.feedback.value.pending"
          />
        </div>
        <Message
          v-if="error || mutation.feedback.value.error"
          severity="error"
          class="sm:col-span-2"
          >{{ error || mutation.feedback.value.error }}</Message
        >
        <div class="flex flex-col gap-4 border-t border-surface pt-5 sm:col-span-2">
          <p class="text-sm text-muted-color">
            Current estimates are shown above. The server confirms product eligibility, pricing and
            order totals when you save.
          </p>
          <div class="flex flex-wrap items-center gap-3">
            <Button
              type="submit"
              label="Save order changes"
              :loading="mutation.feedback.value.pending"
              :disabled="mutation.feedback.value.pending || !canEditOrder(order, now.getTime())"
            />
            <RouterLink
              v-if="!mutation.feedback.value.pending"
              :to="`/orders/${order.id}`"
              class="underline"
              >Back to order</RouterLink
            >
          </div>
        </div>
      </form>
    </template>
  </div>
</template>
