<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from 'primevue/button'
import Paginator from 'primevue/paginator'
import Tag from 'primevue/tag'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { useMediaQuery } from '@vueuse/core'
import QueryStatus from '@/components/shared/QueryStatus.vue'
import { useCommerceQuery } from '@/composables/shared/useCommerceQuery'
import { fetchOrders } from '@/api/orders'
import { formatCurrency } from '@/lib/currency'
import { invoiceAvailable } from '@/utils/checkout/rules'
const props = defineProps<{ invoices?: boolean }>()
const desktop = useMediaQuery('(min-width: 768px)')
const route = useRoute()
const router = useRouter()
const filters = computed(() => ({
  page: Math.max(1, Number(route.query.page) || 1),
  status: typeof route.query.status === 'string' ? route.query.status : undefined,
  date_from: typeof route.query.from === 'string' ? route.query.from : undefined,
  date_to: typeof route.query.to === 'string' ? route.query.to : undefined,
  payment_status: typeof route.query.payment === 'string' ? route.query.payment : undefined,
}))
const draft = reactive({
  status: filters.value.status ?? '',
  from: filters.value.date_from ?? '',
  to: filters.value.date_to ?? '',
  payment: filters.value.payment_status ?? '',
})
const { query } = useCommerceQuery(
  () => ['orders', filters.value],
  (target, signal) => fetchOrders(target, filters.value, signal),
)
const rows = computed(() =>
  props.invoices
    ? (query.data.value?.data.filter(invoiceAvailable) ?? [])
    : (query.data.value?.data ?? []),
)
watch(filters, (value) =>
  Object.assign(draft, {
    status: value.status ?? '',
    from: value.date_from ?? '',
    to: value.date_to ?? '',
    payment: value.payment_status ?? '',
  }),
)
function search() {
  void router.replace({
    query: {
      ...(draft.status ? { status: draft.status } : {}),
      ...(draft.from ? { from: draft.from } : {}),
      ...(draft.to ? { to: draft.to } : {}),
      ...(draft.payment ? { payment: draft.payment } : {}),
    },
  })
}
function page(value: number) {
  void router.push({ query: { ...route.query, page: value + 1 } })
}
</script>
<template>
  <div class="flex min-w-0 flex-col gap-5">
    <p class="text-muted-color">
      {{
        invoices
          ? 'Find issued invoices for your company orders.'
          : 'Review your orders, delivery details and payment status.'
      }}
    </p>
    <form
      class="grid items-end gap-4 border-b border-surface pb-5 sm:grid-cols-2 xl:grid-cols-4"
      @submit.prevent="search"
    >
      <div class="flex min-w-0 flex-col gap-2">
        <label id="orders-status-label" for="orders-status">Order status</label>
        <Select
          inputId="orders-status"
          name="status"
          ariaLabelledby="orders-status-label"
          v-model="draft.status"
          :options="[
            { label: 'All statuses', value: '' },
            ...['New Order', 'Dispatch Staged', 'Dispatched', 'Completed', 'Cancelled'].map(
              (value) => ({ label: value, value }),
            ),
          ]"
          optionLabel="label"
          optionValue="value"
        />
      </div>
      <div class="flex min-w-0 flex-col gap-2">
        <label for="orders-from">Delivery from</label>
        <InputText id="orders-from" name="date_from" v-model="draft.from" type="date" />
      </div>
      <div class="flex min-w-0 flex-col gap-2">
        <label for="orders-to">Delivery to</label>
        <InputText
          id="orders-to"
          name="date_to"
          v-model="draft.to"
          type="date"
          :min="draft.from || undefined"
        />
      </div>
      <div class="flex min-w-0 flex-col gap-2">
        <label id="orders-payment-label" for="orders-payment">Payment status</label>
        <Select
          inputId="orders-payment"
          name="payment_status"
          ariaLabelledby="orders-payment-label"
          v-model="draft.payment"
          :options="[
            { label: 'All payments', value: '' },
            ...['pending', 'paid', 'partially_paid', 'overdue'].map((value) => ({
              label: value,
              value,
            })),
          ]"
          optionLabel="label"
          optionValue="value"
        />
      </div>
      <div class="flex flex-wrap gap-3 sm:col-span-2 xl:col-span-4">
        <Button type="submit" label="Apply filters" severity="secondary" variant="outlined" />
        <Button
          v-if="filters.status || filters.date_from || filters.date_to || filters.payment_status"
          type="button"
          label="Clear filters"
          severity="secondary"
          variant="text"
          @click="router.replace({ query: {} })"
        />
      </div>
    </form>
    <QueryStatus
      :pending="query.isPending.value"
      :error="query.error.value"
      :fetching="query.isFetching.value"
      @retry="query.refetch()"
    />
    <template v-if="query.data.value && !query.isError.value">
      <p v-if="invoices" class="text-sm text-muted-color">
        Issued invoices are shown for eligible orders on this results page. Use delivery dates and
        payment filters to find a document.
      </p>
      <p role="status" class="text-sm text-muted-color">
        {{
          invoices
            ? `${rows.length} issued invoices on this page`
            : `${query.data.value.total} orders`
        }}
      </p>
      <p v-if="!rows.length">
        {{ invoices ? 'No issued invoices on this page.' : 'No orders match these filters.' }}
      </p>
      <DataTable
        v-else-if="desktop"
        :value="rows"
        dataKey="id"
        :tableProps="{ 'aria-label': invoices ? 'Invoices' : 'Orders' }"
        tableClass="min-w-[42rem]"
        class="min-w-0"
        size="small"
      >
        <Column header="Reference" headerClass="whitespace-nowrap"
          ><template #body="{ data }">
            <RouterLink
              :to="invoices ? `/account/invoices/${data.id}` : `/orders/${data.id}`"
              class="font-medium underline"
              >{{ data.order_number }}</RouterLink
            >
          </template></Column
        >
        <Column header="Delivery" headerClass="whitespace-nowrap"
          ><template #body="{ data }">
            <p class="whitespace-nowrap tabular-nums">
              {{ data.delivery_date?.slice(0, 10) ?? 'Not available' }}
            </p>
            <p class="text-sm text-muted-color">{{ data.delivery_slot }}</p>
          </template></Column
        >
        <Column header="Status" headerClass="whitespace-nowrap"
          ><template #body="{ data }"><Tag :value="data.status" severity="secondary" /></template
        ></Column>
        <Column header="Payment" headerClass="whitespace-nowrap"
          ><template #body="{ data }">{{
            data.payment_status ?? 'Not available'
          }}</template></Column
        >
        <Column
          header="Total"
          headerClass="whitespace-nowrap"
          bodyClass="whitespace-nowrap text-right tabular-nums"
          ><template #body="{ data }">{{ formatCurrency(data.total_amount) }}</template></Column
        >
      </DataTable>
      <ul v-else role="list" class="flex flex-col" :aria-label="invoices ? 'Invoices' : 'Orders'">
        <li
          v-for="order in rows"
          :key="order.id"
          class="flex min-w-0 flex-col gap-3 border-b border-surface py-4 first:pt-0"
        >
          <div class="flex flex-wrap items-center justify-between gap-3">
            <RouterLink
              :to="invoices ? `/account/invoices/${order.id}` : `/orders/${order.id}`"
              class="font-semibold underline"
              >{{ order.order_number }}</RouterLink
            >
            <p class="font-semibold tabular-nums">{{ formatCurrency(order.total_amount) }}</p>
          </div>
          <dl class="grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-1">
              <dt class="text-sm font-medium">Delivery</dt>
              <dd class="tabular-nums text-muted-color">
                {{ order.delivery_date?.slice(0, 10) ?? 'Not available' }}
                <p class="text-sm">{{ order.delivery_slot }}</p>
              </dd>
            </div>
            <div class="flex flex-col gap-1">
              <dt class="text-sm font-medium">Payment</dt>
              <dd class="text-muted-color">{{ order.payment_status ?? 'Not available' }}</dd>
            </div>
          </dl>
          <div><Tag :value="order.status" severity="secondary" /></div>
        </li>
      </ul>
      <Paginator
        v-if="query.data.value.total > 15"
        :first="(filters.page - 1) * 15"
        :rows="15"
        :totalRecords="query.data.value.total"
        @page="page($event.page)"
      />
    </template>
  </div>
</template>
