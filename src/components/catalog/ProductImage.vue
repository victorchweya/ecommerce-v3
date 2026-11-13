<script setup lang="ts">
import { shallowRef, watch } from 'vue'
import ImageIcon from '@primeicons/vue/image'
const props = defineProps<{ src: string | null; name: string; aspect?: 'square' | 'landscape' }>()
const failed = shallowRef(false)
watch(
  () => props.src,
  () => {
    failed.value = false
  },
)
</script>
<template>
  <img
    v-if="src && !failed"
    :src="src"
    :alt="name"
    loading="lazy"
    class="w-full rounded-border object-contain"
    :class="aspect === 'landscape' ? 'aspect-[4/3]' : 'aspect-square'"
    @error="failed = true"
  />
  <div
    v-else
    class="flex items-center justify-center rounded-border bg-emphasis p-4 text-muted-color"
    :class="aspect === 'landscape' ? 'aspect-[4/3]' : 'aspect-square'"
    role="img"
    :aria-label="`No image available for ${name}`"
  >
    <ImageIcon aria-hidden="true" class="h-8 w-8 shrink-0" />
  </div>
</template>
