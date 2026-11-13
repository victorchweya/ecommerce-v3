<script setup lang="ts">
import Envelope from '@primeicons/vue/envelope'
import Phone from '@primeicons/vue/phone'
</script>
<template>
  <address class="flex flex-col gap-3 not-italic">
    <a
      href="mailto:sales@farmtofeedkenya.com"
      class="flex items-center gap-3 break-all rounded-border border border-surface p-4 underline"
      ><Envelope aria-hidden="true" class="shrink-0" />sales@farmtofeedkenya.com</a
    ><a
      href="tel:+254795851756"
      class="flex items-center gap-3 rounded-border border border-surface p-4 underline"
      ><Phone aria-hidden="true" class="shrink-0" />+254 795 851 756</a
    >
  </address>
</template>
