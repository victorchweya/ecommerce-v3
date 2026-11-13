<script setup lang="ts">
import { shallowRef } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { invitationEmailSchema } from '@/validation/account'

const visible = defineModel<boolean>('visible', { required: true })
defineProps<{ pending: boolean; error: string; companyName?: string }>()
const emit = defineEmits<{ submit: [email: string]; afterHide: [] }>()
const email = shallowRef('')
const validationError = shallowRef('')

function send() {
  const result = invitationEmailSchema.safeParse(email.value.trim())
  validationError.value = result.success ? '' : 'Enter a valid email address.'
  if (result.success) emit('submit', result.data)
}
function afterHide() {
  email.value = ''
  validationError.value = ''
  emit('afterHide')
}
</script>

<template>
  <Dialog
    id="staff-invitation-dialog"
    v-model:visible="visible"
    header="Invite member"
    modal
    blockScroll
    :draggable="false"
    :closable="!pending"
    :closeOnEscape="!pending"
    class="w-96 max-w-[calc(100vw_-_2rem)]"
    @after-hide="afterHide"
  >
    <form class="flex flex-col gap-5" novalidate @submit.prevent="send">
      <p class="text-sm text-muted-color">
        Send an email invitation to join {{ companyName || 'your company' }}.
      </p>
      <div class="flex flex-col gap-2">
        <label for="staff-email">Email address</label>
        <InputText
          id="staff-email"
          name="staff_email"
          v-model="email"
          type="email"
          required
          autocomplete="email"
          autofocus
          fluid
          :disabled="pending"
          :invalid="Boolean(validationError || error)"
          :aria-describedby="validationError || error ? 'staff-invitation-error' : undefined"
        />
      </div>
      <Message v-if="validationError || error" id="staff-invitation-error" severity="error">
        {{ validationError || error }}
      </Message>
      <div class="flex flex-wrap justify-end gap-2">
        <Button
          label="Cancel"
          type="button"
          severity="secondary"
          variant="text"
          :disabled="pending"
          @click="visible = false"
        />
        <Button label="Send invitation" type="submit" :loading="pending" :disabled="pending" />
      </div>
    </form>
  </Dialog>
</template>
