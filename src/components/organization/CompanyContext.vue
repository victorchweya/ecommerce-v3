<script setup lang="ts">
import { computed } from 'vue'
import Message from 'primevue/message'
import Button from 'primevue/button'
import { useOrganization } from '@/composables/organization/useOrganization'
const { company, ready, companyError, isParent, selectedBranch } = useOrganization()
const { isFetching, refetch, data } = company
const showBranch = computed(
  () =>
    ready.value &&
    isParent.value &&
    selectedBranch.value &&
    data.value?.id === selectedBranch.value.id,
)
</script>

<template>
  <div
    v-if="isFetching || companyError || showBranch"
    class="flex flex-col gap-3"
    aria-live="polite"
  >
    <p v-if="isFetching" role="status">Loading company details…</p>
    <template v-else-if="companyError">
      <Message severity="error">{{ companyError }}</Message>
      <Button
        label="Retry company details"
        severity="secondary"
        class="self-start"
        @click="refetch()"
      />
    </template>
    <p v-else-if="showBranch && data">
      Shopping for <strong>{{ data.name }}</strong
      >.
    </p>
  </div>
</template>
