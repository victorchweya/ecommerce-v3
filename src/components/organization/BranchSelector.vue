<script setup lang="ts">
import Select from 'primevue/select'
import type { Branch } from '@/types/organization'
defineProps<{ branches: Branch[]; selectedId: number | null; pending: boolean; inputId: string }>()
const emit = defineEmits<{ select: [id: number] }>()
</script>

<template>
  <div class="flex w-full flex-col gap-2 sm:max-w-sm">
    <label :id="`${inputId}-label`" :for="inputId">Shopping branch</label>
    <Select
      :inputId="inputId"
      :ariaLabelledby="`${inputId}-label`"
      :modelValue="selectedId"
      :options="branches"
      optionLabel="name"
      optionValue="id"
      placeholder="Select a branch"
      :loading="pending"
      :disabled="pending || !branches.length"
      fluid
      @update:modelValue="emit('select', $event)"
    />
  </div>
</template>
