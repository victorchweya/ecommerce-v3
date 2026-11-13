<script setup lang="ts">
import { ref } from 'vue'
import Message from 'primevue/message'
import { updateCompany } from '@/api/organization'
import { useCommerceMutation } from '@/composables/shared/useCommerceMutation'
import type { CompanyUpdate } from '@/types/organization'
import ContactPersonForm from './ContactPersonForm.vue'
import BillingDetailsForm from './BillingDetailsForm.vue'
const notice = ref('')
const mutation = useCommerceMutation(
  (target, input: CompanyUpdate) => updateCompany(target.token, target.branchId, input),
  () => {
    notice.value = 'Company details saved.'
  },
)
</script>
<template>
  <section v-if="mutation.company.data.value" class="flex min-w-0 flex-col gap-8">
    <div class="flex flex-col gap-2">
      <h2 class="text-xl font-semibold">Company details</h2>
      <p class="text-sm text-muted-color">{{ mutation.company.data.value.name }}</p>
    </div>
    <p v-if="notice" role="status">{{ notice }}</p>
    <Message v-if="mutation.feedback.value.error" severity="error">
      {{ mutation.feedback.value.error }}
    </Message>
    <section aria-labelledby="company-contact-title" class="flex min-w-0 flex-col gap-4">
      <h3 id="company-contact-title" class="font-medium">Company contact</h3>
      <ContactPersonForm
        :company="mutation.company.data.value"
        :pending="mutation.feedback.value.pending"
        :field-errors="mutation.feedback.value.fieldErrors"
        error=""
        action-label="Save company contact"
        compact-action
        @submit="mutation.save"
      />
    </section>
    <section
      aria-labelledby="company-billing-title"
      class="flex min-w-0 flex-col gap-4 border-t border-surface pt-8"
    >
      <h3 id="company-billing-title" class="font-medium">Billing details</h3>
      <BillingDetailsForm
        :company="mutation.company.data.value"
        :pending="mutation.feedback.value.pending"
        :field-errors="mutation.feedback.value.fieldErrors"
        error=""
        action-label="Save billing details"
        compact-action
        @submit="mutation.save"
      />
    </section>
  </section>
</template>
