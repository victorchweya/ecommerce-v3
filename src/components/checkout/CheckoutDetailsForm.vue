<script setup lang="ts">
import { computed, reactive, useId, watch } from 'vue'
import Select from 'primevue/select'
import RadioButton from 'primevue/radiobutton'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { formatCurrency } from '@/lib/currency'
import type { Company } from '@/types/organization'
import type { Address } from '@/types/addresses'
import type { CheckoutDetails } from '@/types/checkout'
import { checkoutConfiguration, deliverySlots, nairobiDate } from '@/utils/checkout/rules'
const props = defineProps<{
  company: Company
  addresses: Address[]
  onlyPartner: boolean
  hasPartner: boolean
  disabled: boolean
  now: number
}>()
const emit = defineEmits<{ submit: [details: CheckoutDetails] }>()
const id = useId()
const details = reactive<CheckoutDetails>({
  delivery_type: 'Delivery',
  delivery_address_id: null,
  delivery_date: '',
  delivery_slot: '',
  partner_products_delivery_date: '',
  delivery_notes: '',
  payment_type: 'credit',
  mpesa_number: '',
  recurring_dates: [],
})
const payments = computed(() =>
  checkoutConfiguration(props.company).payments.map((value) => ({
    value,
    label:
      value === 'mpesa' ? 'M-Pesa' : value === 'credit' ? 'Credit account' : 'Cash on delivery',
  })),
)
if (payments.value[0])
  details.payment_type = payments.value[0].value as CheckoutDetails['payment_type']
const methods = computed(() => [
  { value: 'Delivery', label: 'Delivery' },
  ...(props.addresses.some((address) => address.address_type === 'pickup')
    ? [{ value: 'Pickup', label: 'Pickup at an available location' }]
    : []),
])
const locations = computed(() =>
  props.addresses
    .filter((address) =>
      details.delivery_type === 'Delivery'
        ? address.company_id === props.company.id && address.address_type !== 'pickup'
        : address.address_type === 'pickup',
    )
    .map((address) => ({
      id: address.id,
      label: `${address.name}${address.address ? ` — ${address.address}` : ''}`,
    })),
)
const selectedAddress = computed(() =>
  props.addresses.find((address) => address.id === details.delivery_address_id),
)
const slots = computed(() =>
  deliverySlots(
    details.delivery_date,
    details.delivery_type,
    props.company,
    props.onlyPartner,
    props.now,
  ),
)
watch(
  () => details.payment_type,
  (value) => {
    if (value === 'mpesa') details.recurring_dates = []
  },
)
watch(
  () => details.delivery_type,
  () => {
    details.delivery_address_id = null
  },
)
watch(
  locations,
  (choices) => {
    if (!choices.some((address) => address.id === details.delivery_address_id))
      details.delivery_address_id =
        props.addresses.find(
          (address) => address.is_default && choices.some((choice) => choice.id === address.id),
        )?.id ?? null
  },
  { immediate: true },
)
watch(
  slots,
  (values) => {
    if (!values.includes(details.delivery_slot)) details.delivery_slot = values[0] ?? ''
  },
  { immediate: true },
)
</script>
<template>
  <form
    class="grid w-full min-w-0 max-w-7xl items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]"
    @submit.prevent="emit('submit', { ...details, recurring_dates: [...details.recurring_dates] })"
  >
    <div class="flex min-w-0 flex-col gap-8">
      <fieldset :disabled="disabled" class="grid min-w-0 gap-4 sm:grid-cols-2">
        <legend class="pb-3 text-xl font-semibold">Delivery details</legend>
        <fieldset class="flex flex-wrap items-center gap-x-6 gap-y-2 sm:col-span-2">
          <legend class="sr-only">Delivery method</legend>
          <label
            v-for="method in methods"
            :key="method.value"
            :for="`${id}-method-${method.value}`"
            class="flex min-h-11 cursor-pointer items-center gap-3"
          >
            <RadioButton
              :inputId="`${id}-method-${method.value}`"
              :name="`${id}-delivery-method`"
              v-model="details.delivery_type"
              :value="method.value"
              :disabled="disabled"
            />
            <span>{{ method.label }}</span>
          </label>
        </fieldset>
        <div class="flex min-w-0 flex-col gap-2 sm:col-span-2">
          <label :id="`${id}-address-label`" :for="`${id}-address`"
            >Delivery or pickup address</label
          ><Select
            :inputId="`${id}-address`"
            name="delivery_address_id"
            :ariaLabelledby="`${id}-address-label`"
            v-model="details.delivery_address_id"
            :options="locations"
            optionLabel="label"
            optionValue="id"
            placeholder="Choose an address"
            labelClass="whitespace-normal"
            :disabled="disabled"
          />
        </div>
        <div
          v-if="selectedAddress"
          class="flex flex-wrap items-start justify-between gap-3 text-sm text-muted-color sm:col-span-2"
        >
          <p>
            {{ selectedAddress.address
            }}<template v-if="selectedAddress.city">, {{ selectedAddress.city }}</template>
          </p>
          <p>Delivery fee per order: {{ formatCurrency(selectedAddress.delivery_fee ?? 0) }}</p>
        </div>
        <p v-if="!locations.length" class="sm:col-span-2">
          No address is available for this method.
          <RouterLink to="/account/addresses" class="underline"
            >Manage delivery addresses</RouterLink
          >.
        </p>
        <div class="flex flex-col gap-2">
          <label :for="`${id}-date`">Delivery date</label
          ><InputText
            :id="`${id}-date`"
            name="delivery_date"
            v-model="details.delivery_date"
            type="date"
            :min="nairobiDate(now)"
            required
            :disabled="disabled"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label :id="`${id}-slot-label`" :for="`${id}-slot`">Delivery window</label
          ><Select
            :inputId="`${id}-slot`"
            name="delivery_slot"
            :ariaLabelledby="`${id}-slot-label`"
            v-model="details.delivery_slot"
            :options="slots"
            :disabled="disabled"
          />
        </div>
        <div
          v-if="
            hasPartner &&
            !onlyPartner &&
            !checkoutConfiguration(company).options?.consolidate_invoice
          "
          class="flex flex-col gap-2 sm:col-span-2"
        >
          <label :for="`${id}-partner`">Partner delivery date (optional; otherwise same date)</label
          ><InputText
            :id="`${id}-partner`"
            name="partner_products_delivery_date"
            v-model="details.partner_products_delivery_date"
            type="date"
            :disabled="disabled"
          />
          <p class="text-sm text-muted-color">
            Partner orders use the 12:00–14:00 window and may be created separately.
          </p>
        </div>
        <div class="flex flex-col gap-2 sm:col-span-2">
          <label :for="`${id}-notes`">Delivery notes (optional)</label
          ><Textarea
            :id="`${id}-notes`"
            name="delivery_notes"
            v-model="details.delivery_notes"
            :maxlength="2000"
            rows="2"
            :disabled="disabled"
          />
        </div>
      </fieldset>
      <fieldset
        :disabled="disabled"
        class="flex min-w-0 flex-col gap-4 border-t border-surface pt-5"
      >
        <legend class="pb-3 text-xl font-semibold">Payment</legend>
        <Message v-if="!payments.length" severity="warn"
          >No payment methods are configured for this company. Contact the team to
          continue.</Message
        >
        <fieldset class="flex min-w-0 flex-col">
          <legend class="sr-only">Payment method</legend>
          <label
            v-for="payment in payments"
            :key="payment.value"
            :for="`${id}-payment-${payment.value}`"
            class="flex min-h-12 cursor-pointer items-center gap-3 border-b border-surface py-3 last:border-0"
          >
            <RadioButton
              :inputId="`${id}-payment-${payment.value}`"
              :name="`${id}-payment`"
              v-model="details.payment_type"
              :value="payment.value"
              :disabled="disabled"
            />
            <span>{{ payment.label }}</span>
          </label>
        </fieldset>
        <template v-if="details.payment_type === 'mpesa'"
          ><label :for="`${id}-phone`">M-Pesa phone number</label
          ><InputText
            :id="`${id}-phone`"
            name="mpesa_number"
            v-model="details.mpesa_number"
            type="tel"
            autocomplete="tel"
            required
            :disabled="disabled"
          />
          <p class="text-sm text-muted-color">
            Confirm the prompt on your phone, then confirm the paid order here. The displayed amount
            is an estimate; the server confirms order totals.
          </p></template
        >
      </fieldset>
      <details v-if="details.payment_type !== 'mpesa'" class="border-t border-surface pt-4">
        <summary class="cursor-pointer">Repeat this order (optional)</summary>
        <fieldset
          :disabled="disabled"
          class="flex min-w-0 flex-col gap-3 border-t border-surface pt-5"
        >
          <legend class="sr-only">Repeat deliveries</legend>
          <p class="text-sm text-muted-color">
            Add separate future delivery dates for the same selections and delivery window.
          </p>
          <div
            v-for="(_, index) in details.recurring_dates"
            :key="index"
            class="flex flex-wrap items-end gap-3"
          >
            <div class="flex flex-col gap-2">
              <label :for="`${id}-repeat-${index}`">Additional delivery date {{ index + 1 }}</label
              ><InputText
                :id="`${id}-repeat-${index}`"
                :name="`recurring_dates[${index}]`"
                v-model="details.recurring_dates[index]"
                type="date"
                required
                :disabled="disabled"
              />
            </div>
            <Button
              :label="`Remove date ${index + 1}`"
              type="button"
              severity="secondary"
              :disabled="disabled"
              @click="details.recurring_dates.splice(index, 1)"
            />
          </div>
          <Button
            type="button"
            label="Add another delivery date"
            severity="secondary"
            variant="outlined"
            class="self-start"
            :disabled="disabled"
            @click="details.recurring_dates.push('')"
          />
        </fieldset>
      </details>
    </div>
    <aside
      aria-label="Order summary"
      class="flex min-w-0 flex-col gap-6 lg:sticky lg:top-6 lg:border-l lg:border-surface lg:pl-8"
    >
      <slot
        name="review"
        :deliveryFee="selectedAddress ? (selectedAddress.delivery_fee ?? 0) : null"
      />
      <section
        aria-label="Review and place order"
        class="flex flex-col gap-4 border-t border-surface pt-5"
      >
        <p class="text-sm text-muted-color">
          Review
          <RouterLink to="/terms-and-conditions" class="underline">terms and conditions</RouterLink>
          and
          <RouterLink to="/delivery-information" class="underline">delivery information</RouterLink>
          before ordering.
        </p>
        <Button
          type="submit"
          class="min-h-11 w-full"
          :label="details.payment_type === 'mpesa' ? 'Request M-Pesa payment' : 'Place order'"
          :disabled="disabled || !payments.length"
        />
      </section>
    </aside>
  </form>
</template>
