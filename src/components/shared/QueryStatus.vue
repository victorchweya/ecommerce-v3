<script setup lang="ts">
import Skeleton from 'primevue/skeleton'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { errorMessage } from '@/utils/auth'
defineProps<{ pending: boolean; fetching?: boolean; error: unknown }>()
defineEmits<{ retry: [] }>()
</script>
<template>
  <div v-if="pending && !error" role="status" class="flex flex-col gap-3">
    <span class="sr-only">Loading…</span><Skeleton width="60%" height="1rem" /><Skeleton
      height="5rem"
    />
  </div>
  <div v-if="error" class="flex flex-col items-start gap-3">
    <Message severity="error">{{ errorMessage(error) }}</Message>
    <Button label="Try again" severity="secondary" :disabled="fetching" @click="$emit('retry')" />
  </div>
</template>
