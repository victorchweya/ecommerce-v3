<script setup lang="ts">
import { Form, type FormSubmitEvent } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from 'primevue/button'
import Message from 'primevue/message'
import FormField from '@/components/form/FormField.vue'
import { registrationSchema } from '@/validation/auth'
import { companyCategories } from '@/validation/organization'
import type { FormFeedback } from '@/types/forms'
import type { RegistrationInput } from '@/types/auth'
const props = defineProps<FormFeedback>()
const emit = defineEmits<{ submit: [input: RegistrationInput] }>()
const initialValues = { business_name: '', category: '', name: '', email: '', phone: '' }
const resolver = zodResolver(registrationSchema)
const categories = [...companyCategories]
const fields = [
  { name: 'business_name', label: 'Business name', type: 'text', autocomplete: 'organization' },
  { name: 'name', label: 'Your name', type: 'text', autocomplete: 'name' },
  { name: 'email', label: 'Email', type: 'email', autocomplete: 'email' },
  { name: 'phone', label: 'Phone number', type: 'tel', autocomplete: 'tel-national' },
] as const
function submit(event: FormSubmitEvent) {
  if (event.valid && !props.pending) emit('submit', registrationSchema.parse(event.values))
}
</script>
<template>
  <Form
    v-slot="$form"
    :initialValues="initialValues"
    :resolver="resolver"
    class="grid grid-cols-1 gap-5 @sm:grid-cols-2"
    @submit="submit"
  >
    <Message v-if="error" severity="error" class="col-span-full">{{ error }}</Message>
    <FormField
      v-for="input in fields"
      :key="input.name"
      v-slot="field"
      :name="input.name"
      :label="input.label"
      :input-id="`register-${input.name}`"
      :server-errors="fieldErrors[input.name]"
    >
      <InputText
        :id="`register-${input.name}`"
        :type="input.type"
        :autocomplete="input.autocomplete"
        :disabled="pending"
        :invalid="field.invalid"
        :aria-describedby="field.describedBy"
        fluid
      />
    </FormField>
    <div class="col-span-full flex flex-col gap-2">
      <label id="register-category-label" for="register-category">Business category</label>
      <!-- Direct Form binding avoids a delayed Select blur after FormField unregisters. -->
      <Select
        name="category"
        inputId="register-category"
        ariaLabelledby="register-category-label"
        aria-describedby="register-category-error"
        :options="categories"
        placeholder="Choose a category"
        :disabled="pending"
        :invalid="Boolean($form.category?.invalid || fieldErrors.category)"
        fluid
      />
      <Message
        v-if="$form.category?.invalid || fieldErrors.category"
        id="register-category-error"
        severity="error"
        size="small"
        variant="simple"
        >{{ $form.category?.error?.message || fieldErrors.category?.[0] }}</Message
      >
    </div>
    <p class="col-span-full text-sm text-muted-color">
      We will use these details to contact you about your business account.
    </p>
    <Button
      type="submit"
      class="col-span-full"
      label="Register your business"
      :loading="pending"
      :disabled="pending"
      fluid
    />
  </Form>
</template>
