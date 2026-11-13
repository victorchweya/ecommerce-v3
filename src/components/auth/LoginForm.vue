<script setup lang="ts">
import { Form, type FormSubmitEvent } from '@primevue/forms'
import { RouterLink } from 'vue-router'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { loginSchema } from '@/validation/auth'
import type { LoginInput } from '@/types/auth'

const props = defineProps<{
  pending: boolean
  error: string
  fieldErrors: Record<string, string[]>
}>()
const emit = defineEmits<{ submit: [input: LoginInput] }>()
const initialValues = { email: '', password: '' }
const resolver = zodResolver(loginSchema)
function submit(event: FormSubmitEvent) {
  if (event.valid && !props.pending) emit('submit', loginSchema.parse(event.values))
}
</script>

<template>
  <Form
    v-slot="$form"
    :initialValues="initialValues"
    :resolver="resolver"
    :validateOnBlur="true"
    class="flex flex-col gap-5"
    @submit="submit"
  >
    <Message v-if="error" severity="error">{{ error }}</Message>
    <div class="flex flex-col gap-2">
      <label for="login-email">Email</label>
      <InputText
        id="login-email"
        name="email"
        type="email"
        autocomplete="username"
        :disabled="pending"
        :invalid="Boolean($form.email?.invalid || fieldErrors.email)"
        aria-describedby="login-email-error"
        fluid
      />
      <Message
        v-if="$form.email?.invalid || fieldErrors.email"
        id="login-email-error"
        severity="error"
        size="small"
        variant="simple"
        >{{ $form.email?.error?.message || fieldErrors.email?.[0] }}</Message
      >
    </div>
    <div class="flex flex-col gap-2">
      <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <label for="login-password">Password</label
        ><RouterLink :to="{ name: 'forgotPassword' }" class="underline"
          >Forgot password?</RouterLink
        >
      </div>
      <Password
        inputId="login-password"
        name="password"
        autocomplete="current-password"
        :feedback="false"
        :disabled="pending"
        :invalid="Boolean($form.password?.invalid || fieldErrors.password)"
        :inputProps="{ 'aria-describedby': 'login-password-error' }"
        fluid
      />
      <Message
        v-if="$form.password?.invalid || fieldErrors.password"
        id="login-password-error"
        severity="error"
        size="small"
        variant="simple"
        >{{ $form.password?.error?.message || fieldErrors.password?.[0] }}</Message
      >
    </div>
    <Button type="submit" label="Sign in" :loading="pending" :disabled="pending" fluid />
  </Form>
</template>
