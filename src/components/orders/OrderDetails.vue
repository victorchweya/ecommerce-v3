<script setup lang="ts">
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import { RouterLink } from 'vue-router'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useNow, useIntervalFn } from '@vueuse/core'
import { fetchOrder } from '@/api/orders'
import { useCommerceQuery } from '@/composables/shared/useCommerceQuery'
import { canEditOrder, invoiceAvailable } from '@/utils/checkout/rules'
import QueryStatus from '@/components/shared/QueryStatus.vue'
import OrderLines from './OrderLines.vue'
import OrderTotals from './OrderTotals.vue'
import OrderActions from './OrderActions.vue'
import OrderReorder from './OrderReorder.vue'
const route = useRoute()
const id = computed(() => Number(route.params.id))
const { query, key } = useCommerceQuery(
  () => ['orders', id.value],
  (target, signal) => fetchOrder(target, id.value, signal),
  () => Number.isSafeInteger(id.value) && id.value > 0,
)
const now = useNow({ scheduler: (update) => useIntervalFn(update, 1000) })
</script>
<template>
  <div class="flex min-w-0 flex-col gap-6">
    <QueryStatus
      :pending="query.isPending.value"
      :error="query.error.value"
      :fetching="query.isFetching.value"
      @retry="query.refetch()"
    />
    <template v-if="query.data.value && !query.isError.value">
      <section class="flex min-w-0 flex-col gap-5 border-b border-surface pb-6">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex flex-wrap items-center gap-3">
            <h2 class="text-xl font-semibold">{{ query.data.value.order_number }}</h2>
            <Tag :value="query.data.value.status" severity="secondary" />
          </div>
          <div class="flex flex-wrap gap-3">
            <Button
              v-if="canEditOrder(query.data.value, now.getTime())"
              :as="RouterLink"
              :to="`/orders/${id}/edit`"
              label="Edit order"
              severity="secondary"
              variant="outlined"
            />
            <Button
              v-if="invoiceAvailable(query.data.value)"
              :as="RouterLink"
              :to="`/account/invoices/${id}`"
              label="View invoice"
              severity="secondary"
              variant="outlined"
            />
          </div>
        </div>
        <dl class="grid grid-cols-2 gap-5 sm:grid-cols-3">
          <div class="flex flex-col gap-1">
            <dt class="font-medium">{{ query.data.value.delivery_type ?? 'Delivery' }}</dt>
            <dd class="text-muted-color tabular-nums">
              {{ query.data.value.delivery_date?.slice(0, 10) ?? 'Not available' }}
              <p class="text-sm">{{ query.data.value.delivery_slot }}</p>
            </dd>
          </div>
          <div
            class="order-last col-span-2 flex min-w-0 flex-col gap-1 sm:order-none sm:col-span-1"
          >
            <dt class="font-medium">Delivery address</dt>
            <dd class="text-muted-color">
              {{
                [
                  query.data.value.address?.name,
                  query.data.value.address?.address,
                  query.data.value.address?.city,
                ]
                  .filter(Boolean)
                  .join(', ') || 'Not available'
              }}
            </dd>
          </div>
          <div class="flex flex-col gap-1">
            <dt class="font-medium">Payment status</dt>
            <dd class="text-muted-color">
              {{ query.data.value.payment_status ?? 'Not available' }}
            </dd>
          </div>
        </dl>
        <p v-if="query.data.value.delivery_notes" class="text-sm text-muted-color">
          Notes: {{ query.data.value.delivery_notes }}
        </p>
      </section>
      <div class="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_17rem]">
        <aside
          aria-label="Order totals"
          class="flex min-w-0 flex-col gap-5 xl:col-start-2 xl:row-start-1 xl:sticky xl:top-6 xl:border-l xl:border-surface xl:pl-6"
        >
          <h2 class="text-xl font-semibold">Order summary</h2>
          <OrderTotals :order="query.data.value" />
          <div class="border-t border-surface pt-5">
            <OrderReorder :key="`${key}:${id}`" :order="query.data.value" />
          </div>
        </aside>
        <section
          aria-label="Order items"
          class="flex min-w-0 flex-col gap-4 xl:col-start-1 xl:row-start-1"
        >
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="text-xl font-semibold">Order items</h2>
            <p class="text-sm text-muted-color">
              {{ query.data.value.order_line_items.length }} items
            </p>
          </div>
          <OrderLines :lines="query.data.value.order_line_items" />
        </section>
      </div>
      <OrderActions :key="`${key}:${id}`" :order="query.data.value" />
    </template>
    <RouterLink to="/orders" class="self-start underline">Back to orders</RouterLink>
  </div>
</template>
