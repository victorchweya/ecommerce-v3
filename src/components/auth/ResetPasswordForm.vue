<script setup lang="ts">
import { Form, type FormSubmitEvent } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { resetPasswordSchema } from '@/validation/auth'
import type { ResetPasswordInput } from '@/types/auth'
const props = defineProps<{
  email: string
  token: string
  pending: boolean
  error: string
  fieldErrors: Record<string, string[]>
}>()
const emit = defineEmits<{ submit: [input: ResetPasswordInput] }>()
const initialValues = {
  email: props.email,
  token: props.token,
  password: '',
  password_confirmation: '',
}
const resolver = zodResolver(resetPasswordSchema)
function submit(event: FormSubmitEvent) {
  if (event.valid && !props.pending) emit('submit', resetPasswordSchema.parse(event.values))
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
      <label for="reset-email">Email</label>
      <InputText
        id="reset-email"
        name="email"
        type="email"
        autocomplete="username"
        :disabled="pending"
        aria-describedby="reset-email-error"
        fluid
      />
      <Message
        v-if="$form.email?.invalid || fieldErrors.email"
        id="reset-email-error"
        severity="error"
        size="small"
        variant="simple"
        >{{ $form.email?.error?.message || fieldErrors.email?.[0] }}</Message
      >
    </div>
    <InputText name="token" type="hidden" />
    <Message
      v-if="$form.token?.invalid || fieldErrors.token"
      severity="error"
      size="small"
      variant="simple"
      >{{ $form.token?.error?.message || fieldErrors.token?.[0] }}</Message
    >
    <div class="flex flex-col gap-2">
      <label for="reset-password">New password</label>
      <Password
        inputId="reset-password"
        name="password"
        autocomplete="new-password"
        :feedback="false"
        :disabled="pending"
        :inputProps="{ 'aria-describedby': 'reset-password-error' }"
        fluid
      />
      <Message
        v-if="$form.password?.invalid || fieldErrors.password"
        id="reset-password-error"
        severity="error"
        size="small"
        variant="simple"
        >{{ $form.password?.error?.message || fieldErrors.password?.[0] }}</Message
      >
    </div>
    <div class="flex flex-col gap-2">
      <label for="confirm-password">Confirm password</label>
      <Password
        inputId="confirm-password"
        name="password_confirmation"
        autocomplete="new-password"
        :feedback="false"
        :disabled="pending"
        :inputProps="{ 'aria-describedby': 'confirm-password-error' }"
        fluid
      />
      <Message
        v-if="$form.password_confirmation?.invalid || fieldErrors.password_confirmation"
        id="confirm-password-error"
        severity="error"
        size="small"
        variant="simple"
        >{{
          $form.password_confirmation?.error?.message || fieldErrors.password_confirmation?.[0]
        }}</Message
      >
    </div>
    <Button type="submit" label="Reset password" :loading="pending" :disabled="pending" fluid />
  </Form>
</template>
