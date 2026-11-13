<script setup lang="ts">
import AccountLayout from '@/layouts/AccountLayout.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { fetchOrder } from '@/api/orders'
import { useCommerceQuery } from '@/composables/shared/useCommerceQuery'
import { canEditOrder } from '@/utils/checkout/rules'
import QueryStatus from '@/components/shared/QueryStatus.vue'
import OrderEditor from '@/components/orders/OrderEditor.vue'
const route = useRoute()
const id = computed(() => Number(route.params.id))
const { query, key } = useCommerceQuery(
  () => ['orders', id.value],
  (target, signal) => fetchOrder(target, id.value, signal),
  () => Number.isSafeInteger(id.value) && id.value > 0,
)
</script>
<template>
  <AccountLayout>
    <section class="flex min-w-0 flex-col gap-6">
      <h1 class="text-2xl font-semibold">Edit order</h1>
      <QueryStatus
        :pending="query.isPending.value"
        :error="query.error.value"
        @retry="query.refetch()"
      /><template v-if="query.data.value && !query.isError.value"
        ><OrderEditor
          v-if="canEditOrder(query.data.value)"
          :key="`${key}:${id}`"
          :order="query.data.value"
        />
        <p v-else>
          This order can no longer be edited here.
          <RouterLink :to="`/orders/${id}`" class="underline">View order</RouterLink>.
        </p></template
      >
    </section>
  </AccountLayout>
</template>
