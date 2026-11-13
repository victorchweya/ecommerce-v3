<script setup lang="ts">
import { FormField as PrimeFormField } from '@primevue/forms'
import Message from 'primevue/message'
defineProps<{ name: string; label: string; inputId: string; serverErrors?: string[] }>()
</script>
<template>
  <PrimeFormField v-slot="field" :name="name" class="flex min-w-0 flex-col gap-2">
    <label :id="`${inputId}-label`" :for="inputId">{{ label }}</label>
    <slot
      :invalid="Boolean(field.invalid || serverErrors?.length)"
      :described-by="`${inputId}-error`"
      :label-id="`${inputId}-label`"
    />
    <Message
      v-if="field.invalid || serverErrors?.length"
      :id="`${inputId}-error`"
      severity="error"
      size="small"
      variant="simple"
      >{{ field.error?.message || serverErrors?.[0] }}</Message
    >
  </PrimeFormField>
</template>
