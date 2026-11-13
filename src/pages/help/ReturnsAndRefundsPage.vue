<script setup lang="ts">
import InformationPage from '@/components/shared/InformationPage.vue'
import ContactLinks from '@/components/shared/ContactLinks.vue'
</script>
<template>
  <InformationPage title="Returns and refunds"
    ><p>
      Our terms require produce complaints or refund/return requests to be communicated to Farm to
      Feed within 8 hours of delivery to receive a credit note.
    </p>
    <p>
      Our terms provide for replacement of rejected produce or a credit note rather than a cash
      refund. Contact the team with your order number and details of the issue so they can review
      your request.
    </p>
    <ContactLinks />
    <p>You can view issued credit notes in your account.</p>
    <RouterLink to="/account/credit-notes" class="self-start underline"
      >View credit notes</RouterLink
    ><RouterLink to="/terms-and-conditions" class="self-start underline"
      >Read the full terms and conditions</RouterLink
    ></InformationPage
  >
</template>
