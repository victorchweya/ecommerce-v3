<script setup lang="ts">
import { useRoute } from 'vue-router'
defineProps<{ vertical?: boolean }>()
const route = useRoute()
const steps = [
  { name: 'contactPerson', label: 'Contact' },
  { name: 'billingDetails', label: 'Billing' },
  { name: 'deliveryAddress', label: 'Delivery' },
]
</script>
<template>
  <nav
    aria-label="Account setup"
    :class="
      vertical ? 'flex flex-col gap-4' : 'grid grid-cols-3 gap-2 border-b border-surface pb-4'
    "
  >
    <RouterLink
      v-for="(item, index) in steps"
      :key="item.name"
      :to="{ name: item.name }"
      :aria-current="route.name === item.name ? 'step' : undefined"
      class="flex min-w-0 items-center rounded-border px-2 py-3 hover:bg-emphasis"
      :class="[
        vertical ? 'flex-row gap-3' : 'flex-col gap-2',
        { 'border border-surface': route.name === item.name },
      ]"
    >
      <span
        class="flex size-8 shrink-0 items-center justify-center rounded-full border border-surface tabular-nums"
        aria-hidden="true"
        >{{ index + 1 }}</span
      ><span>{{ item.label }}</span>
    </RouterLink>
  </nav>
</template>
