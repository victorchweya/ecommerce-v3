<script setup lang="ts">
import { Form, type FormSubmitEvent } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import InputText from 'primevue/inputtext'
import FileUpload, { type FileUploadUploaderEvent } from 'primevue/fileupload'
import Button from 'primevue/button'
import Message from 'primevue/message'
import FormField from '@/components/form/FormField.vue'
import { billingDetailsSchema } from '@/validation/organization'
import { billingDefaults } from '@/utils/organization'
import { useCertificate } from '@/composables/organization/useCertificate'
import type { Company, BillingDetailsInput } from '@/types/organization'
import type { FormFeedback } from '@/types/forms'
const props = defineProps<
  FormFeedback & {
    company: Company
    twoColumns?: boolean
    actionLabel?: string
    compactAction?: boolean
  }
>()
const emit = defineEmits<{ submit: [input: BillingDetailsInput] }>()
const initialValues = billingDefaults(props.company)
const resolver = zodResolver(billingDetailsSchema)
const certificate = useCertificate()
const { data, name, error: certificateError, reading, clear } = certificate
const fields = [
  {
    name: 'business_name',
    label: 'Billing business name',
    serverKey: 'billing_details.business_name',
  },
  { name: 'address', label: 'Billing address', serverKey: 'billing_details.address' },
  { name: 'postal_code', label: 'Postal code', serverKey: 'billing_details.postal_code' },
  { name: 'city', label: 'Billing city', serverKey: 'billing_details.city' },
  { name: 'kra_pin', label: 'KRA PIN (optional)', serverKey: 'kra_pin' },
] as const
function select(event: FileUploadUploaderEvent) {
  certificate.select(Array.isArray(event.files) ? event.files[0] : event.files)
}
function submit(event: FormSubmitEvent) {
  if (!event.valid || props.pending || reading.value || certificateError.value) return
  const { kra_pin, ...billing_details } = billingDetailsSchema.parse(event.values)
  emit('submit', {
    billing_details,
    kra_pin: kra_pin || null,
    ...(data.value ? { kra_certificate: data.value } : {}),
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
      :input-id="`billing-${input.name}`"
      :server-errors="fieldErrors[input.serverKey]"
    >
      <InputText
        :id="`billing-${input.name}`"
        :disabled="pending"
        :invalid="field.invalid"
        :aria-describedby="field.describedBy"
        fluid
      />
    </FormField>
    <fieldset class="col-span-full flex min-w-0 flex-col gap-3">
      <legend class="pb-2">KRA certificate (optional)</legend>
      <p v-if="company.kra_certificate" class="text-sm text-muted-color">
        A certificate is already saved. Choose a file only if you want to replace it.
      </p>
      <FileUpload
        mode="basic"
        customUpload
        auto
        chooseLabel="Choose certificate"
        accept="application/pdf,image/jpeg,image/png,image/webp"
        :maxFileSize="5000000"
        :disabled="pending || reading"
        @uploader="select"
      />
      <p v-if="reading" role="status">Reading certificate…</p>
      <p v-if="name" role="status" class="break-words">Selected: {{ name }}</p>
      <Message v-if="certificateError || fieldErrors.kra_certificate" severity="error">{{
        certificateError || fieldErrors.kra_certificate?.[0]
      }}</Message>
      <Button
        v-if="name || certificateError"
        type="button"
        label="Clear selected certificate"
        severity="secondary"
        variant="text"
        :disabled="pending"
        class="self-start"
        @click="clear"
      />
    </fieldset>
    <Button
      type="submit"
      class="col-span-full"
      :class="{ 'self-start justify-self-start': compactAction }"
      :severity="compactAction ? 'secondary' : undefined"
      :variant="compactAction ? 'outlined' : undefined"
      :label="actionLabel ?? 'Save billing and continue'"
      :loading="pending"
      :disabled="pending || reading || Boolean(certificateError)"
      :fluid="!compactAction"
    />
  </Form>
</template>
