<script setup lang="ts">
import Sparkles from '@primeicons/vue/sparkles'
import Truck from '@primeicons/vue/truck'
import Wallet from '@primeicons/vue/wallet'
const features = [
  {
    icon: Sparkles,
    title: 'Sustainable',
    description: 'Rescued produce supports farmers and reduces food loss.',
  },
  {
    icon: Truck,
    title: 'Convenient',
    description: 'Personal service and flexible delivery options.',
  },
  { icon: Wallet, title: 'Affordable', description: 'Quality produce that protects your margins.' },
]
</script>
<template>
  <div class="flex flex-col gap-12">
    <div class="flex flex-col gap-5">
      <p class="text-muted-color">Shaping the future of food.</p>
      <h2 class="text-2xl font-semibold">Fresh produce,<br />Smarter supply.</h2>
      <p class="max-w-sm text-muted-color">
        Connecting farmers, markets, and ingredients through smarter supply chains.
      </p>
    </div>
    <dl class="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div v-for="feature in features" :key="feature.title" class="min-w-0">
        <dt class="flex flex-col items-start gap-3 font-semibold">
          <component :is="feature.icon" class="size-5 shrink-0" aria-hidden="true" />{{
            feature.title
          }}
        </dt>
        <dd class="pt-2 text-muted-color">{{ feature.description }}</dd>
      </div>
    </dl>
  </div>
</template>
