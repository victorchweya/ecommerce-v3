<script setup lang="ts">
import { ref } from 'vue'
import { Form, type FormSubmitEvent } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Message from 'primevue/message'
import FormField from '@/components/form/FormField.vue'
import { passwordChangeSchema } from '@/validation/account'
import { updateProfile } from '@/api/account'
import { useCommerceMutation } from '@/composables/shared/useCommerceMutation'
const version = ref(0)
const notice = ref('')
const initialValues = { current_password: '', password: '', password_confirmation: '' }
const mutation = useCommerceMutation(
  updateProfile,
  () => {
    notice.value = 'Password changed.'
    version.value++
  },
  true,
)
function submit(event: FormSubmitEvent) {
  if (event.valid) mutation.save(passwordChangeSchema.parse(event.values))
}
</script>
<template>
  <Form
    :key="version"
    :initialValues="initialValues"
    :resolver="zodResolver(passwordChangeSchema)"
    class="flex flex-col gap-4"
    @submit="submit"
    ><div class="flex flex-col gap-2">
      <h2 class="text-xl font-semibold">Change password</h2>
      <p class="text-sm text-muted-color">Use a strong password to protect your account.</p>
    </div>
    <div class="flex min-w-0 flex-col gap-4">
      <p v-if="notice" role="status">{{ notice }}</p>
      <Message v-if="mutation.feedback.value.error" severity="error">{{
        mutation.feedback.value.error
      }}</Message
      ><FormField
        v-for="field in [
          { name: 'current_password', label: 'Current password' },
          { name: 'password', label: 'New password' },
          { name: 'password_confirmation', label: 'Confirm new password' },
        ]"
        :key="field.name"
        v-slot="feedback"
        :name="field.name"
        :label="field.label"
        :input-id="`change-${field.name}`"
        :server-errors="mutation.feedback.value.fieldErrors[field.name]"
        ><InputText
          :id="`change-${field.name}`"
          type="password"
          :autocomplete="field.name === 'current_password' ? 'current-password' : 'new-password'"
          :disabled="mutation.feedback.value.pending"
          :invalid="feedback.invalid"
          :aria-describedby="feedback.describedBy"
          fluid /></FormField
      ><Button
        type="submit"
        label="Change password"
        severity="secondary"
        variant="outlined"
        class="self-start"
        :loading="mutation.feedback.value.pending"
        :disabled="mutation.feedback.value.pending"
      /></div
  ></Form>
</template>
