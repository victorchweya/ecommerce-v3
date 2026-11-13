<script setup lang="ts">
import { onErrorCaptured, shallowRef, watch } from 'vue'

const props = defineProps<{ resetKey: string }>()
const failed = shallowRef(false)

onErrorCaptured((error) => {
  console.error('Unhandled view error:', error)
  failed.value = true
  return false
})

watch(
  () => props.resetKey,
  () => {
    failed.value = false
  },
)
</script>

<template>
  <slot v-if="failed" name="fallback" />
  <slot v-else />
</template>
