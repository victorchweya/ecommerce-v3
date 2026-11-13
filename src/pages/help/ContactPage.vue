<script setup lang="ts">
import InformationPage from '@/components/shared/InformationPage.vue'
import ContactLinks from '@/components/shared/ContactLinks.vue'
</script>
<template>
  <InformationPage title="Contact"
    ><p>
      Contact the Farm to Feed team for account access, delivery questions, order changes or payment
      assistance.
    </p>
    <ContactLinks />
    <p>
      For an order enquiry, include your order number. For a payment enquiry, keep the payment
      reference available. Do not send passwords or M-Pesa PINs.
    </p>
    <RouterLink to="/help" class="self-start underline">Browse help</RouterLink></InformationPage
  >
</template>
