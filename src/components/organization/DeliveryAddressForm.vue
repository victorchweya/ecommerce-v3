<script setup lang="ts">
import { Form, type FormSubmitEvent } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Message from 'primevue/message'
import FormField from '@/components/form/FormField.vue'
import { deliveryDetailsSchema } from '@/validation/organization'
import { useDeliveryLocation } from '@/composables/organization/useDeliveryLocation'
import type { Company } from '@/types/organization'
import type { Address, DeliveryAddressInput } from '@/types/addresses'
import type { FormFeedback } from '@/types/forms'
const props = defineProps<
  FormFeedback & {
    company: Company
    makeDefault: boolean
    initialAddress?: Address
    twoColumns?: boolean
    actionLabel?: string
    compactAction?: boolean
  }
>()
const emit = defineEmits<{ submit: [input: DeliveryAddressInput] }>()
const initialValues = {
  name: props.initialAddress?.name ?? '',
  address: props.initialAddress?.address ?? '',
  city: props.initialAddress?.city ?? '',
  contact_person_name:
    props.initialAddress?.contact_person_name ?? props.company.contact_person_name ?? '',
  contact_person_phone:
    props.initialAddress?.contact_person_phone ?? props.company.contact_person_phone ?? '',
}
const resolver = zodResolver(deliveryDetailsSchema)
const {
  latitude,
  longitude,
  locating,
  error: locationError,
  locate,
  coordinates,
} = useDeliveryLocation()
latitude.value = props.initialAddress?.latitude?.toString() ?? ''
longitude.value = props.initialAddress?.longitude?.toString() ?? ''
const fields = [
  { name: 'name', label: 'Location name', type: 'text' },
  { name: 'address', label: 'Delivery address', type: 'text' },
  { name: 'city', label: 'City', type: 'text' },
  { name: 'contact_person_name', label: 'Delivery contact', type: 'text' },
  { name: 'contact_person_phone', label: 'Delivery contact phone', type: 'tel' },
] as const
function submit(event: FormSubmitEvent) {
  const location = coordinates()
  if (!event.valid || !location || props.pending || locating.value) return
  emit('submit', {
    ...deliveryDetailsSchema.parse(event.values),
    ...location,
    address_type: props.initialAddress?.address_type === 'home' ? 'home' : 'office',
    is_default: props.makeDefault,
  })
}
</script>
<template>
  <Form
    :initialValues="initialValues"
    :resolver="resolver"
    :class="twoColumns ? 'grid grid-cols-1 gap-5 @sm:grid-cols-2' : 'flex flex-col gap-5'"
    @submit="submit"
  >
    <Message v-if="error" severity="error" class="col-span-full">{{ error }}</Message>
    <FormField
      v-for="input in fields"
      :key="input.name"
      v-slot="field"
      :name="input.name"
      :label="input.label"
      :input-id="`delivery-${input.name}`"
      :server-errors="fieldErrors[input.name]"
    >
      <InputText
        :id="`delivery-${input.name}`"
        :type="input.type"
        :disabled="pending"
        :invalid="field.invalid"
        :aria-describedby="field.describedBy"
        fluid
      />
    </FormField>
    <fieldset class="col-span-full flex min-w-0 flex-col gap-3">
      <legend class="pb-2">Delivery location</legend>
      <p class="text-sm text-muted-color">
        Select a location while you are at the delivery address, or enter its coordinates manually.
      </p>
      <Button
        type="button"
        label="Use my current location"
        severity="secondary"
        :loading="locating"
        :disabled="pending || locating"
        class="self-start"
        @click="locate"
      />
      <p v-if="latitude && longitude" role="status">
        Location selected. Confirm that this is your delivery location before saving.
      </p>
      <details class="flex flex-col gap-3">
        <summary class="cursor-pointer">Enter or review coordinates</summary>
        <div class="grid gap-4 py-3 sm:grid-cols-2">
          <div class="flex flex-col gap-2">
            <label for="delivery-latitude">Latitude</label
            ><InputText
              id="delivery-latitude"
              v-model="latitude"
              inputmode="decimal"
              :disabled="pending || locating"
              fluid
            />
          </div>
          <div class="flex flex-col gap-2">
            <label for="delivery-longitude">Longitude</label
            ><InputText
              id="delivery-longitude"
              v-model="longitude"
              inputmode="decimal"
              :disabled="pending || locating"
              fluid
            />
          </div>
        </div>
      </details>
      <Message
        v-if="locationError || fieldErrors.latitude || fieldErrors.longitude"
        severity="error"
        >{{ locationError || fieldErrors.latitude?.[0] || fieldErrors.longitude?.[0] }}</Message
      >
    </fieldset>
    <Button
      type="submit"
      class="col-span-full"
      :class="{ 'self-start justify-self-start': compactAction }"
      :severity="compactAction ? 'secondary' : undefined"
      :variant="compactAction ? 'outlined' : undefined"
      :label="actionLabel ?? 'Save delivery address and finish'"
      :loading="pending"
      :disabled="pending || locating"
      :fluid="!compactAction"
    />
  </Form>
</template>
