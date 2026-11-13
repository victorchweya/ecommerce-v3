<script setup lang="ts">
import InformationPage from '@/components/shared/InformationPage.vue'
</script>
<template>
  <InformationPage title="Delivery information"
    ><section class="flex flex-col gap-3">
      <h2 class="text-xl font-semibold">Choose your delivery details</h2>
      <p>
        Use a saved delivery address, or an available pickup location where one is provided for your
        company. Checkout shows the delivery methods and windows supported by your account.
      </p>
      <p>
        The selected address determines the delivery fee. Review the date, window, contact person
        and delivery instructions before placing your order.
      </p>
    </section>
    <section class="flex flex-col gap-3">
      <h2 class="text-xl font-semibold">Dates and cut-offs</h2>
      <p>
        Delivery days and order cut-offs can depend on your customer group. Checkout checks your
        selected dates again before submitting. Dairy selections must be ordered before 3 pm Nairobi
        time.
      </p>
      <p>
        Partner products may be delivered separately, with a 12:00–14:00 window. Recurring orders
        create additional deliveries on the dates you select. Separate orders may carry separate
        delivery charges.
      </p>
    </section>
    <section class="flex flex-col gap-3">
      <h2 class="text-xl font-semibold">Check your confirmation</h2>
      <p>
        Open each confirmed order for its final delivery details and total. Contact the team with
        your order number if you need assistance.
      </p>
    </section>
    <RouterLink to="/terms-and-conditions" class="self-start underline"
      >Read the delivery terms</RouterLink
    ><RouterLink to="/contact" class="self-start underline"
      >Contact the team</RouterLink
    ></InformationPage
  >
</template>
