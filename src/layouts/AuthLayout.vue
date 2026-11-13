<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AuthIntroduction from '@/components/auth/AuthIntroduction.vue'
import AccountSetupNavigation from '@/components/auth/AccountSetupNavigation.vue'
const route = useRoute()
const centered = computed(() =>
  ['passwordResetCheckEmail', 'accountPendingApproval'].includes(String(route.name)),
)
</script>

<template>
  <div
    class="isolate min-h-dvh"
    :class="centered ? 'flex flex-col' : 'grid grid-rows-[auto_1fr] md:grid-cols-2 md:grid-rows-1'"
  >
    <a href="#main-content" class="sr-only focus:not-sr-only focus:p-4">Skip to content</a>
    <div
      class="min-w-0"
      :class="
        centered
          ? ''
          : [
              'md:sticky md:top-0 md:flex md:h-dvh md:flex-col md:self-start',
              route.meta.onboarding ? '' : 'md:justify-center md:p-8 lg:p-12 2xl:p-16',
            ]
      "
    >
      <AppHeader
        class="border-none"
        :class="{ 'md:[&>nav]:px-0': !centered && !route.meta.onboarding }"
      />
      <aside
        v-if="!centered"
        aria-label="Farm to Feed"
        class="hidden min-w-0 flex-col gap-12 md:flex"
        :class="route.meta.onboarding ? 'flex-1 p-8 lg:p-12 2xl:p-16' : ''"
      >
        <AccountSetupNavigation v-if="route.meta.onboarding" vertical />
        <AuthIntroduction v-else />
      </aside>
    </div>
    <main
      id="main-content"
      tabindex="-1"
      class="flex min-w-0 items-center justify-center px-4 pt-7 pb-12 sm:px-12 md:px-9 md:py-12 xl:px-16"
      :class="centered ? 'flex-1' : 'md:bg-surface-50 md:dark:bg-surface-900'"
    >
      <div class="@container w-full max-w-lg"><slot /></div>
    </main>
  </div>
</template>
