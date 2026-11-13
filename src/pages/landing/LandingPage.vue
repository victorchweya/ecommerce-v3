<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import LandingHero from '@/components/landing/LandingHero.vue'
import LandingCatalog from '@/components/landing/LandingCatalog.vue'
import ShoppingLinks from '@/components/landing/ShoppingLinks.vue'
const auth = useAuthStore()
</script>
<template>
  <div class="flex flex-col gap-12">
    <LandingHero />
    <template v-if="auth.token">
      <LandingCatalog />
      <ShoppingLinks />
    </template>
    <section
      v-else
      aria-labelledby="getting-started-heading"
      class="flex flex-col gap-6 border-t border-surface pt-8"
    >
      <h2 id="getting-started-heading" class="text-xl font-semibold">
        Start ordering for your business
      </h2>
      <dl class="grid gap-6 md:grid-cols-3">
        <div>
          <dt class="font-semibold">1. Request your account</dt>
          <dd class="pt-2 text-muted-color">
            Share your business details so our team can help you get started.
          </dd>
        </div>
        <div>
          <dt class="font-semibold">2. Complete your setup</dt>
          <dd class="pt-2 text-muted-color">
            Once your account is ready, add your contacts, billing and delivery details.
          </dd>
        </div>
        <div>
          <dt class="font-semibold">3. Build your order</dt>
          <dd class="pt-2 text-muted-color">
            Choose products and quantities, review your cart and arrange delivery at checkout.
          </dd>
        </div>
      </dl>
      <RouterLink to="/help" class="self-start underline">Shopping help</RouterLink>
    </section>
  </div>
</template>
