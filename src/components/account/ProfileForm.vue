<script setup lang="ts">
import { ref } from 'vue'
import { Form, type FormSubmitEvent } from '@primevue/forms'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Message from 'primevue/message'
import FormField from '@/components/form/FormField.vue'
import { profileDetailsSchema } from '@/validation/account'
import { updateProfile } from '@/api/account'
import { useCommerceMutation } from '@/composables/shared/useCommerceMutation'
import type { Profile } from '@/types/auth'
const props = defineProps<{ profile: Profile }>()
const notice = ref('')
const initialValues = {
  name: props.profile.name,
  phone: props.profile.phone ?? '',
  designation: props.profile.customer?.designation ?? '',
}
const mutation = useCommerceMutation(
  updateProfile,
  () => {
    notice.value = 'Profile saved.'
  },
  true,
)
function submit(event: FormSubmitEvent) {
  if (event.valid) mutation.save(profileDetailsSchema.parse(event.values))
}
</script>
<template>
  <Form
    :initialValues="initialValues"
    :resolver="zodResolver(profileDetailsSchema)"
    class="flex flex-col gap-4"
    @submit="submit"
  >
    <div class="flex min-w-0 flex-col gap-2">
      <h2 class="text-xl font-semibold">Your profile</h2>
      <p class="text-sm text-muted-color [overflow-wrap:anywhere]">{{ profile.email }}</p>
    </div>
    <div class="flex min-w-0 flex-col gap-4">
      <p v-if="notice" role="status">{{ notice }}</p>
      <Message v-if="mutation.feedback.value.error" severity="error">{{
        mutation.feedback.value.error
      }}</Message>
      <div class="flex flex-col gap-4">
        <FormField
          v-for="field in [
            { name: 'name', label: 'Your name' },
            { name: 'phone', label: 'Your phone number' },
            { name: 'designation', label: 'Your designation (optional)' },
          ]"
          :key="field.name"
          v-slot="feedback"
          :name="field.name"
          :label="field.label"
          :input-id="`profile-${field.name}`"
          :server-errors="mutation.feedback.value.fieldErrors[field.name]"
        >
          <InputText
            :id="`profile-${field.name}`"
            :disabled="mutation.feedback.value.pending"
            :invalid="feedback.invalid"
            :aria-describedby="feedback.describedBy"
            fluid
          />
        </FormField>
      </div>
      <Button
        type="submit"
        label="Save profile"
        severity="secondary"
        variant="outlined"
        class="self-start"
        :loading="mutation.feedback.value.pending"
        :disabled="mutation.feedback.value.pending"
      />
    </div>
  </Form>
</template>
