<script setup lang="ts">
import ShoppingCart from '@primeicons/vue/shopping-cart'
import Heart from '@primeicons/vue/heart'
import Box from '@primeicons/vue/box'
const links = [
  {
    to: '/cart',
    title: 'Review your cart',
    text: 'Continue with the products you have selected.',
    icon: ShoppingCart,
  },
  {
    to: '/favourites',
    title: 'Shop your favourites',
    text: 'Find the products you order regularly.',
    icon: Heart,
  },
  {
    to: '/orders',
    title: 'Manage orders',
    text: 'View previous orders and order again.',
    icon: Box,
  },
]
</script>
<template>
  <section aria-label="Continue shopping" class="flex flex-col gap-6 border-t border-surface pt-8">
    <div class="grid gap-6 md:grid-cols-3">
      <RouterLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="group flex items-start gap-3"
      >
        <component :is="link.icon" class="size-5 shrink-0" aria-hidden="true" />
        <div class="flex min-w-0 flex-col gap-2">
          <h2 class="font-semibold group-hover:underline">{{ link.title }}</h2>
          <p class="text-muted-color">{{ link.text }}</p>
        </div>
      </RouterLink>
    </div>
  </section>
</template>
