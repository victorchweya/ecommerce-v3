<script setup lang="ts">
import Truck from '@primeicons/vue/truck'
import StorefrontIdentity from './StorefrontIdentity.vue'
const year = new Date().getFullYear()
const groups = [
  {
    title: 'Shop',
    links: [
      { label: 'All products', to: '/catalog' },
      { label: 'Favourites', to: '/favourites' },
      { label: 'Cart', to: '/cart' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'My account', to: '/account' },
      { label: 'Order history', to: '/orders' },
      { label: 'Delivery addresses', to: '/account/addresses' },
      { label: 'Invoices', to: '/account/invoices' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help centre', to: '/help' },
      { label: 'Delivery information', to: '/delivery-information' },
      { label: 'Returns and refunds', to: '/returns-and-refunds' },
      { label: 'Contact us', to: '/contact' },
    ],
  },
]
</script>
<template>
  <footer class="border-t border-surface print:hidden">
    <div class="mx-auto w-full max-w-8xl px-4 py-10 sm:px-6 lg:py-12">
      <div class="grid gap-10 lg:grid-cols-[7fr_15fr] lg:gap-16">
        <div class="flex flex-col items-start gap-4">
          <StorefrontIdentity />
          <p class="max-w-sm text-muted-color">
            Fresh produce and wholesale groceries, delivered to your business.
          </p>
          <p class="flex items-start gap-3 text-muted-color">
            <Truck class="size-5 shrink-0 text-primary" aria-hidden="true" />
            <span>Order before 22:00 for next-day delivery</span>
          </p>
        </div>
        <nav
          aria-label="Footer navigation"
          class="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:gap-x-10"
        >
          <div
            v-for="group in groups"
            :key="group.title"
            class="flex flex-col gap-3 last:col-span-2 sm:last:col-span-1"
          >
            <h2 class="font-semibold">{{ group.title }}</h2>
            <ul role="list" class="flex flex-col items-start gap-1 text-muted-color">
              <li v-for="link in group.links" :key="link.to">
                <RouterLink
                  :to="link.to"
                  class="inline-flex min-h-10 items-center py-1 hover:text-color hover:underline"
                  >{{ link.label }}</RouterLink
                >
              </li>
            </ul>
          </div>
        </nav>
      </div>
      <div
        class="mt-10 flex flex-col gap-4 border-t border-surface pt-6 text-muted-color sm:flex-row sm:items-center sm:justify-between lg:mt-12"
      >
        <p>© {{ year }} Storefront. All rights reserved.</p>
        <nav aria-label="Legal navigation" class="flex flex-wrap gap-x-6 gap-y-2">
          <RouterLink
            to="/terms-and-conditions"
            class="inline-flex min-h-10 items-center hover:text-color hover:underline"
            >Terms</RouterLink
          >
          <RouterLink
            to="/privacy-policy"
            class="inline-flex min-h-10 items-center hover:text-color hover:underline"
            >Privacy</RouterLink
          >
        </nav>
      </div>
    </div>
  </footer>
</template>
