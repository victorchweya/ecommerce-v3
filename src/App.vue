<script setup lang="ts">
import { useCheckoutSession } from '@/composables/checkout/useCheckoutSession'
import { useCartSession } from '@/composables/cart/useCartSession'
import { RouterView, useRoute } from 'vue-router'
import AppErrorBoundary from '@/components/shared/AppErrorBoundary.vue'
import StorefrontLayout from '@/layouts/StorefrontLayout.vue'
import AuthLayout from '@/layouts/AuthLayout.vue'
import ErrorPage from '@/pages/ErrorPage.vue'

const route = useRoute()
useCartSession()
useCheckoutSession()
</script>

<template>
  <component :is="route.path.startsWith('/auth/') ? AuthLayout : StorefrontLayout">
    <AppErrorBoundary :reset-key="route.fullPath">
      <RouterView />
      <template #fallback>
        <ErrorPage />
      </template>
    </AppErrorBoundary>
  </component>
</template>
