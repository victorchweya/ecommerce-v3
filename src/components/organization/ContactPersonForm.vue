<script setup lang="ts">
import { Form, type FormSubmitEvent } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Message from 'primevue/message'
import FormField from '@/components/form/FormField.vue'
import { contactPersonSchema } from '@/validation/organization'
import { contactDefaults } from '@/utils/organization'
import type { Company, ContactPersonInput } from '@/types/organization'
import type { FormFeedback } from '@/types/forms'
const props = defineProps<
  FormFeedback & {
    company: Company
    twoColumns?: boolean
    actionLabel?: string
    compactAction?: boolean
  }
>()
const emit = defineEmits<{ submit: [input: ContactPersonInput] }>()
const initialValues = contactDefaults(props.company)
const resolver = zodResolver(contactPersonSchema)
const fields = [
  { name: 'contact_person_name', label: 'Contact name', type: 'text' },
  { name: 'contact_person_email', label: 'Contact email', type: 'email' },
  { name: 'contact_person_phone', label: 'Contact phone', type: 'tel' },
  { name: 'contact_person_designation', label: 'Designation (optional)', type: 'text' },
] as const
function submit(event: FormSubmitEvent) {
  if (event.valid && !props.pending) emit('submit', contactPersonSchema.parse(event.values))
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
      :input-id="input.name"
      :server-errors="fieldErrors[input.name]"
    >
      <InputText
        :id="input.name"
        :type="input.type"
        :disabled="pending"
        :invalid="field.invalid"
        :aria-describedby="field.describedBy"
        fluid
      />
    </FormField>
    <Button
      type="submit"
      class="col-span-full"
      :class="{ 'self-start justify-self-start': compactAction }"
      :severity="compactAction ? 'secondary' : undefined"
      :variant="compactAction ? 'outlined' : undefined"
      :label="actionLabel ?? 'Save contact and continue'"
      :loading="pending"
      :disabled="pending"
      :fluid="!compactAction"
    />
  </Form>
</template>
