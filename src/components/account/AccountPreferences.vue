<script setup lang="ts">
import { ref } from 'vue'
import RadioButton from 'primevue/radiobutton'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { updateProfile } from '@/api/account'
import { useCommerceMutation } from '@/composables/shared/useCommerceMutation'
import type { Profile } from '@/types/auth'
const props = defineProps<{ profile: Profile }>()
const notice = ref('')
const billingEmail = ref(
  props.profile.customer?.notification_preferences?.billing?.email ??
    props.profile.customer?.communication_preference === 'email',
)
const billingSms = ref(
  props.profile.customer?.notification_preferences?.billing?.sms ??
    props.profile.customer?.communication_preference === 'sms',
)
const preference = ref(props.profile.customer?.communication_preference ?? 'email')
const mutation = useCommerceMutation(
  updateProfile,
  (saved) => {
    notice.value = 'Preferences saved.'
    preference.value = saved.customer?.communication_preference ?? 'email'
    billingEmail.value =
      saved.customer?.notification_preferences?.billing?.email ?? preference.value === 'email'
    billingSms.value =
      saved.customer?.notification_preferences?.billing?.sms ?? preference.value === 'sms'
  },
  true,
)
</script>
<template>
  <div class="flex min-w-0 flex-col gap-8">
    <p v-if="notice" role="status">{{ notice }}</p>
    <Message v-if="mutation.feedback.value.error" severity="error">{{
      mutation.feedback.value.error
    }}</Message>
    <form
      class="flex flex-col gap-4 border-b border-surface pb-8"
      @submit.prevent="mutation.save({ communication_preference: preference })"
    >
      <div class="flex flex-col gap-2">
        <h2 class="text-xl font-semibold">Contact preferences</h2>
        <p class="text-sm text-muted-color">Choose how the team contacts you.</p>
      </div>
      <div class="flex min-w-0 flex-col gap-4">
        <fieldset class="flex flex-col">
          <legend class="pb-2">Preferred contact method</legend>
          <label
            v-for="method in [
              { value: 'email', label: 'Email' },
              { value: 'sms', label: 'SMS' },
              { value: 'phone', label: 'Phone' },
            ]"
            :key="method.value"
            :for="`profile-communication-${method.value}`"
            class="flex min-h-11 cursor-pointer items-center gap-3"
          >
            <RadioButton
              :inputId="`profile-communication-${method.value}`"
              name="communication_preference"
              v-model="preference"
              :value="method.value"
              :disabled="mutation.feedback.value.pending"
            />
            <span>{{ method.label }}</span>
          </label>
        </fieldset>
        <Button
          label="Save contact preference"
          type="submit"
          class="self-start"
          severity="secondary"
          variant="outlined"
          :loading="mutation.feedback.value.pending"
          :disabled="mutation.feedback.value.pending"
        />
      </div>
    </form>
    <form
      class="flex flex-col gap-4"
      @submit.prevent="
        mutation.save({
          notification_preferences: { billing: { email: billingEmail, sms: billingSms } },
        })
      "
    >
      <div class="flex flex-col gap-2">
        <h2 class="text-xl font-semibold">Billing notifications</h2>
        <p class="text-sm text-muted-color">Select where you receive billing updates.</p>
      </div>
      <div class="flex min-w-0 flex-col gap-4">
        <fieldset class="flex flex-col">
          <legend class="sr-only">Billing notifications</legend>
          <div class="flex min-h-11 items-center gap-3">
            <Checkbox
              inputId="billing-email"
              name="billing_email"
              v-model="billingEmail"
              binary
              :disabled="mutation.feedback.value.pending"
            />
            <label for="billing-email">Email notifications</label>
          </div>
          <div class="flex min-h-11 items-center gap-3">
            <Checkbox
              inputId="billing-sms"
              name="billing_sms"
              v-model="billingSms"
              binary
              :disabled="mutation.feedback.value.pending"
            />
            <label for="billing-sms">SMS notifications</label>
          </div>
        </fieldset>
        <p class="text-sm text-muted-color">
          Saving a contact method also updates billing notification defaults. Saving billing
          notifications updates your preferred contact method to match.
        </p>
        <Button
          label="Save billing notifications"
          type="submit"
          class="self-start"
          severity="secondary"
          variant="outlined"
          :loading="mutation.feedback.value.pending"
          :disabled="mutation.feedback.value.pending"
        />
      </div>
    </form>
  </div>
</template>
