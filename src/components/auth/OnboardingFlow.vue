<script setup lang="ts">
import AccountSetupNavigation from './AccountSetupNavigation.vue'
import Button from 'primevue/button'
import Message from 'primevue/message'
import ContactPersonForm from '@/components/organization/ContactPersonForm.vue'
import BillingDetailsForm from '@/components/organization/BillingDetailsForm.vue'
import DeliveryAddressForm from '@/components/organization/DeliveryAddressForm.vue'
import { useOnboarding, type OnboardingStep } from '@/composables/auth/useOnboarding'
import { apiFieldErrors, errorMessage } from '@/utils/auth'
const props = defineProps<{ step: OnboardingStep }>()
const { company, addresses, savedAddresses, mutation, contextKey, save, next } = useOnboarding(
  props.step,
)
const headings = {
  contact: 'Contact person',
  billing: 'Billing details',
  delivery: 'Delivery address',
}
const { data, error, isPending, refetch } = company
const { isPending: saving, error: saveError } = mutation
</script>
<template>
  <section aria-labelledby="setup-heading" class="flex w-full flex-col gap-6">
    <h1 id="setup-heading" class="text-2xl font-semibold">{{ headings[step] }}</h1>
    <AccountSetupNavigation class="md:hidden" />
    <p v-if="isPending" role="status">Loading company details…</p>
    <template v-else-if="error || !data">
      <Message severity="error">{{
        error ? errorMessage(error) : 'Company details are unavailable.'
      }}</Message>
      <Button label="Retry company details" severity="secondary" @click="refetch()" />
    </template>
    <template v-else>
      <p>
        Setting up <strong>{{ data.name }}</strong
        >.
      </p>
      <ContactPersonForm
        v-if="step === 'contact'"
        :key="contextKey"
        :company="data"
        two-columns
        :pending="saving"
        :error="saveError ? errorMessage(saveError) : ''"
        :field-errors="apiFieldErrors(saveError)"
        @submit="save({ kind: 'company', input: $event })"
      />
      <BillingDetailsForm
        v-else-if="step === 'billing'"
        :key="contextKey"
        :company="data"
        two-columns
        :pending="saving"
        :error="saveError ? errorMessage(saveError) : ''"
        :field-errors="apiFieldErrors(saveError)"
        @submit="save({ kind: 'company', input: $event })"
      />
      <template v-else>
        <p v-if="addresses.isPending.value" role="status">Loading delivery addresses…</p>
        <template v-else-if="addresses.error.value">
          <Message severity="error">{{ errorMessage(addresses.error.value) }}</Message>
          <Button
            label="Retry delivery addresses"
            severity="secondary"
            @click="addresses.refetch()"
          />
        </template>
        <template v-else>
          <div v-if="savedAddresses.length" class="flex flex-col gap-3">
            <h2 class="font-semibold">Saved delivery addresses</h2>
            <ul class="list-inside list-disc">
              <li v-for="address in savedAddresses" :key="address.id">
                {{ address.name }}<span v-if="address.city"> — {{ address.city }}</span>
              </li>
            </ul>
            <Button
              label="Finish with saved address"
              severity="secondary"
              :disabled="saving"
              @click="next"
            />
            <p>Add another delivery location below if needed.</p>
          </div>
          <DeliveryAddressForm
            :key="contextKey"
            :company="data"
            two-columns
            :make-default="!savedAddresses.length"
            :pending="saving"
            :error="saveError ? errorMessage(saveError) : ''"
            :field-errors="apiFieldErrors(saveError)"
            @submit="save({ kind: 'address', input: $event })"
          />
        </template>
      </template>
      <Button
        label="Set up later"
        severity="secondary"
        variant="text"
        :disabled="saving"
        @click="next"
      />
    </template>
  </section>
</template>
