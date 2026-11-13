<script setup lang="ts">
import { useRoute } from 'vue-router'
import Box from '@primeicons/vue/box'
import User from '@primeicons/vue/user'
import MapMarker from '@primeicons/vue/map-marker'
import File from '@primeicons/vue/file'
import Wallet from '@primeicons/vue/wallet'
import ChartLine from '@primeicons/vue/chart-line'
defineEmits<{ navigate: [] }>()
const route = useRoute()
const groups = [
  {
    label: 'Billing and reports',
    links: [
      { to: '/orders', label: 'Orders', icon: Box },
      { to: '/account/invoices', label: 'Invoices', icon: File },
      { to: '/account/credit-notes', label: 'Credit notes', icon: Wallet },
      { to: '/account/insights', label: 'Order insights', icon: ChartLine },
      { to: '/account/impact', label: 'Impact dashboard', icon: ChartLine },
    ],
  },
  {
    label: 'Account',
    links: [
      { to: '/account', label: 'Account details', icon: User },
      { to: '/account/addresses', label: 'Delivery addresses', icon: MapMarker },
    ],
  },
]
function active(to: string) {
  return route.path === to || (to !== '/account' && route.path.startsWith(`${to}/`))
}
</script>
<template>
  <nav aria-label="Account navigation" class="flex flex-col gap-6">
    <div v-for="group in groups" :key="group.label" class="flex flex-col gap-2">
      <h3 class="px-3 text-sm font-medium text-muted-color">{{ group.label }}</h3>
      <ul role="list" class="flex flex-col gap-1">
        <li v-for="link in group.links" :key="link.to">
          <RouterLink
            :to="link.to"
            :class="{ 'bg-emphasis': active(link.to) }"
            :aria-current="active(link.to) ? 'page' : undefined"
            class="flex min-h-11 items-center gap-3 rounded-border px-3 py-2 hover:bg-emphasis"
            @click="$emit('navigate')"
            active-class=""
            exact-active-class=""
            ><component :is="link.icon" :size="18" aria-hidden="true" class="shrink-0" />{{
              link.label
            }}</RouterLink
          >
        </li>
      </ul>
    </div>
  </nav>
</template>
