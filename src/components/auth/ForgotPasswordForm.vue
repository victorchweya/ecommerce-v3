<script setup lang="ts">
import { Form, type FormSubmitEvent } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { forgotPasswordSchema } from '@/validation/auth'
const props = defineProps<{ pending: boolean; error: string }>()
const emit = defineEmits<{ submit: [email: string] }>()
const initialValues = { email: '' }
const resolver = zodResolver(forgotPasswordSchema)
function submit(event: FormSubmitEvent) {
  if (event.valid && !props.pending) emit('submit', forgotPasswordSchema.parse(event.values).email)
}
</script>

<template>
  <Form
    v-slot="$form"
    :initialValues="initialValues"
    :resolver="resolver"
    class="flex flex-col gap-5"
    @submit="submit"
  >
    <Message v-if="error" severity="error">{{ error }}</Message>
    <div class="flex flex-col gap-2">
      <label for="recovery-email">Email</label>
      <InputText
        id="recovery-email"
        name="email"
        type="email"
        autocomplete="email"
        :disabled="pending"
        aria-describedby="recovery-email-error"
        fluid
      />
      <Message
        v-if="$form.email?.invalid"
        id="recovery-email-error"
        severity="error"
        size="small"
        variant="simple"
        >{{ $form.email.error.message }}</Message
      >
    </div>
    <Button type="submit" label="Send reset link" :loading="pending" :disabled="pending" fluid />
  </Form>
</template>
