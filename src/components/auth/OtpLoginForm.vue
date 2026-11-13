<script setup lang="ts">
import { Form, type FormSubmitEvent } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { otpCodeSchema, otpContactSchema } from '@/validation/auth'
import { useOtpChallenge } from '@/composables/auth/useOtpChallenge'
import { errorMessage } from '@/utils/auth'
import type { OtpLoginInput } from '@/types/auth'

const props = defineProps<{ pending: boolean; error: string }>()
const emit = defineEmits<{ submit: [input: OtpLoginInput]; clear: [] }>()
const { contact, challenge, reset } = useOtpChallenge()
const { data, error: challengeError, isPending, mutate } = challenge
const contactInitialValues = { contact: '' }
const codeInitialValues = { otp_code: '' }
const contactResolver = zodResolver(otpContactSchema)
const codeResolver = zodResolver(otpCodeSchema)
function requestCode(event: FormSubmitEvent) {
  if (event.valid && !isPending.value) mutate(otpContactSchema.parse(event.values).contact)
}
function submit(event: FormSubmitEvent) {
  if (event.valid && data.value && !props.pending)
    emit('submit', {
      ...contact.value,
      otp_token: data.value.otp_token,
      ...otpCodeSchema.parse(event.values),
    })
}
function changeContact() {
  reset()
  emit('clear')
}
</script>

<template>
  <div class="flex flex-col gap-5">
    <Message v-if="props.error || challengeError" severity="error">{{
      props.error || errorMessage(challengeError)
    }}</Message>
    <Form
      v-if="!data"
      v-slot="$form"
      :initialValues="contactInitialValues"
      :resolver="contactResolver"
      class="flex flex-col gap-5"
      @submit="requestCode"
    >
      <div class="flex flex-col gap-2">
        <label for="otp-contact">Email or phone number</label>
        <InputText
          id="otp-contact"
          name="contact"
          autocomplete="username"
          :disabled="isPending"
          aria-describedby="otp-contact-error"
          fluid
        />
        <Message
          v-if="$form.contact?.invalid"
          id="otp-contact-error"
          severity="error"
          size="small"
          variant="simple"
          >{{ $form.contact.error.message }}</Message
        >
      </div>
      <Button type="submit" label="Send code" :loading="isPending" :disabled="isPending" fluid />
    </Form>
    <template v-else>
      <p role="status">
        We sent a code by {{ data.channel === 'sms' ? 'SMS' : 'email' }}. Enter it below to sign in.
      </p>
      <Form
        v-slot="$form"
        :initialValues="codeInitialValues"
        :resolver="codeResolver"
        class="flex flex-col gap-5"
        @submit="submit"
      >
        <div class="flex flex-col gap-2">
          <label for="otp-code">Verification code</label>
          <InputText
            id="otp-code"
            name="otp_code"
            inputmode="numeric"
            autocomplete="one-time-code"
            maxlength="6"
            :disabled="pending"
            aria-describedby="otp-code-error"
            fluid
          />
          <Message
            v-if="$form.otp_code?.invalid"
            id="otp-code-error"
            severity="error"
            size="small"
            variant="simple"
            >{{ $form.otp_code.error.message }}</Message
          >
        </div>
        <Button
          type="submit"
          label="Verify and sign in"
          :loading="pending"
          :disabled="pending"
          fluid
        />
      </Form>
      <Button
        label="Request another code"
        severity="secondary"
        variant="text"
        :disabled="pending"
        @click="changeContact"
      />
    </template>
  </div>
</template>
