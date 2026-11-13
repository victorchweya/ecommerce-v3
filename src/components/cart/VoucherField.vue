<script setup lang="ts">
import { shallowRef, useId } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Message from 'primevue/message'
import type { Voucher } from '@/types/checkout'
import { formatCurrency } from '@/lib/currency'
defineProps<{
  selected: string | null
  available: Voucher | null
  pending: boolean
  discoveryError: boolean
  error: string
  disabled: boolean
  validated: boolean
}>()
defineEmits<{ apply: [code: string]; remove: []; retry: [] }>()
const code = shallowRef('')
const inputId = useId()
</script>
<template>
  <section
    aria-label="Voucher"
    class="flex flex-col gap-3 rounded-border border border-surface p-4"
  >
    <h2 class="text-lg font-semibold">Voucher</h2>
    <template v-if="available && !selected">
      <p>
        {{ available.code }}:
        {{
          available.discount_type === 'Percentage'
            ? `${available.discount_value}% off`
            : `${formatCurrency(available.discount_value)} off`
        }}
      </p>
      <Button
        :label="`Use ${available.code}`"
        severity="secondary"
        class="self-start"
        :disabled="disabled || pending"
        @click="$emit('apply', available.code)"
      />
    </template>
    <p v-if="discoveryError" class="text-sm text-muted-color">
      Available vouchers could not be loaded. You can still enter a code.
    </p>
    <form class="flex flex-col gap-3" @submit.prevent="$emit('apply', code)">
      <label :for="inputId">Voucher code</label>
      <InputText
        :id="inputId"
        v-model="code"
        maxlength="255"
        autocomplete="off"
        :disabled="disabled || pending"
      />
      <Button
        label="Check voucher"
        type="submit"
        severity="secondary"
        class="self-start"
        :loading="pending"
        :disabled="disabled || pending || !code.trim()"
      />
    </form>
    <p v-if="selected" role="status">
      {{ validated ? 'Selected voucher:' : pending ? 'Checking voucher eligibility:' : 'Voucher:' }}
      {{ selected }}
    </p>
    <Message v-if="error" severity="warn">{{ error }}</Message>
    <Button
      v-if="discoveryError"
      label="Retry available vouchers"
      severity="secondary"
      class="self-start"
      :disabled="disabled || pending"
      @click="$emit('retry')"
    />
    <Button
      v-if="selected"
      label="Remove voucher"
      severity="secondary"
      variant="text"
      class="self-start"
      :disabled="disabled"
      @click="$emit('remove')"
    />
  </section>
</template>
