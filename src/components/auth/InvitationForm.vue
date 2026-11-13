<script setup lang="ts">
import { Form, type FormSubmitEvent } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import FormField from '@/components/form/FormField.vue'
import { invitationSchema } from '@/validation/auth'
import type { FormFeedback } from '@/types/forms'
import type { InvitationInput } from '@/types/auth'
const props = defineProps<FormFeedback & { token: string; email: string }>()
const emit = defineEmits<{ submit: [input: InvitationInput] }>()
const initialValues = {
  token: props.token,
  email: props.email,
  name: '',
  phone: '',
  password: '',
  password_confirmation: '',
}
const resolver = zodResolver(invitationSchema)
function submit(event: FormSubmitEvent) {
  if (event.valid && !props.pending) emit('submit', invitationSchema.parse(event.values))
}
</script>
<template>
  <Form
    :initialValues="initialValues"
    :resolver="resolver"
    class="grid grid-cols-1 gap-5 @sm:grid-cols-2"
    @submit="submit"
  >
    <Message v-if="error" severity="error" class="col-span-full">{{ error }}</Message>
    <InputText name="token" type="hidden" />
    <Message v-if="fieldErrors.token" severity="error" class="col-span-full">{{
      fieldErrors.token[0]
    }}</Message>
    <FormField
      v-slot="field"
      name="email"
      class="col-span-full"
      label="Invited email"
      input-id="invitation-email"
      :server-errors="fieldErrors.email"
    >
      <InputText
        id="invitation-email"
        type="email"
        autocomplete="username"
        readonly
        :invalid="field.invalid"
        :aria-describedby="field.describedBy"
        fluid
      />
    </FormField>
    <FormField
      v-slot="field"
      name="name"
      label="Your name"
      input-id="invitation-name"
      :server-errors="fieldErrors.name"
    >
      <InputText
        id="invitation-name"
        autocomplete="name"
        :disabled="pending"
        :invalid="field.invalid"
        :aria-describedby="field.describedBy"
        fluid
      />
    </FormField>
    <FormField
      v-slot="field"
      name="phone"
      label="Phone number"
      input-id="invitation-phone"
      :server-errors="fieldErrors.phone"
    >
      <InputText
        id="invitation-phone"
        type="tel"
        autocomplete="tel"
        :disabled="pending"
        :invalid="field.invalid"
        :aria-describedby="field.describedBy"
        fluid
      />
    </FormField>
    <FormField
      v-for="input in [
        { name: 'password', label: 'Password' },
        { name: 'password_confirmation', label: 'Confirm password' },
      ]"
      :key="input.name"
      v-slot="field"
      :name="input.name"
      :label="input.label"
      :input-id="`invitation-${input.name}`"
      :server-errors="fieldErrors[input.name]"
    >
      <Password
        :inputId="`invitation-${input.name}`"
        autocomplete="new-password"
        :feedback="false"
        :disabled="pending"
        :invalid="field.invalid"
        :inputProps="{ 'aria-describedby': field.describedBy }"
        fluid
      />
    </FormField>
    <Button
      class="col-span-full"
      type="submit"
      label="Accept invitation"
      :loading="pending"
      :disabled="pending"
      fluid
    />
  </Form>
</template>
