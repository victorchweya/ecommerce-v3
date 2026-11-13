<script setup lang="ts">
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordioncontent'
import InformationPage from '@/components/shared/InformationPage.vue'
const questions = [
  {
    title: 'How do I start shopping?',
    text: 'Sign in, select a branch if your account has branches, then browse the catalog. Choose a product grade, unit, quantity and any available processing or specifications before adding it to your cart.',
  },
  {
    title: 'Where is my cart saved?',
    text: 'Your selections are saved on this browser for your signed-in account. Prices are refreshed from the catalog. Review the cart after changing branches; the existing cart is shared across your shopping context.',
  },
  {
    title: 'Why can I not check out?',
    text: 'Review unavailable items, the minimum basket, delivery address, delivery date, voucher and the payment methods configured for your company. Some products and delivery dates have order cut-offs.',
  },
  {
    title: 'What if M-Pesa is pending?',
    text: 'Complete the prompt on your phone and check payment status on the checkout page. If the result is uncertain, keep the payment reference, check your orders and contact support before starting another payment.',
  },
  {
    title: 'Can I change an order?',
    text: 'Open Orders to see the available actions. Eligible new orders can be edited before the cut-off. M-Pesa orders cannot be edited here. Cancellation is available while an order is still new.',
  },
  {
    title: 'Where are invoices and credit notes?',
    text: 'Open Account, then Invoices or Credit notes. An invoice becomes available after the order meets the current issuing requirements. You can print a document or save it as PDF using your browser.',
  },
]
</script>
<template>
  <InformationPage title="Help"
    ><p>Find your way through shopping and account tasks.</p>
    <Accordion
      ><AccordionPanel
        v-for="(question, index) in questions"
        :key="question.title"
        :value="String(index)"
        ><AccordionHeader>{{ question.title }}</AccordionHeader
        ><AccordionContent
          ><p>{{ question.text }}</p></AccordionContent
        ></AccordionPanel
      ></Accordion
    >
    <RouterLink to="/contact" class="self-start underline"
      >Contact the team</RouterLink
    ></InformationPage
  >
</template>
