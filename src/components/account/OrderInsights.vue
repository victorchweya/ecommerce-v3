<script setup lang="ts">
import { shallowRef, ref } from 'vue'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { fetchInsights, fetchPriceTrends } from '@/api/account'
import { useCommerceQuery } from '@/composables/shared/useCommerceQuery'
import { formatCurrency } from '@/lib/currency'
import { nairobiDate } from '@/utils/checkout/rules'
import QueryStatus from '@/components/shared/QueryStatus.vue'
import PriceTrend from './PriceTrend.vue'
const today = nairobiDate()
const month = ref<number | null>(Number(today.slice(5, 7)))
const year = ref<number | null>(Number(today.slice(0, 4)))
const period = shallowRef({ month: month.value!, year: year.value! })
const insights = useCommerceQuery(
  () => ['insights', period.value],
  (target, signal) => fetchInsights(target, period.value.month, period.value.year, signal),
)
const trends = useCommerceQuery(
  () => ['price-trends', period.value],
  (target, signal) => fetchPriceTrends(target, period.value.month, period.value.year, signal),
)
function apply() {
  if (
    Number.isInteger(month.value) &&
    month.value! >= 1 &&
    month.value! <= 12 &&
    Number.isInteger(year.value) &&
    year.value! > 0 &&
    year.value! <= 9999
  )
    period.value = { month: month.value!, year: year.value! }
}
</script>
<template>
  <div class="flex min-w-0 flex-col gap-6">
    <p class="text-muted-color">Review ordered products and pricing for your selected company.</p>
    <form
      class="grid items-end gap-4 border-b border-surface pb-5 sm:grid-cols-[8rem_10rem_auto]"
      @submit.prevent="apply"
    >
      <div class="flex min-w-0 flex-col gap-2">
        <label for="insights-month">Month</label
        ><InputNumber
          inputId="insights-month"
          name="month"
          v-model="month"
          :min="1"
          :max="12"
          :useGrouping="false"
          inputClass="w-full"
          class="w-full"
        />
      </div>
      <div class="flex min-w-0 flex-col gap-2">
        <label for="insights-year">Year</label
        ><InputNumber
          inputId="insights-year"
          name="year"
          v-model="year"
          :min="1"
          :max="9999"
          :useGrouping="false"
          inputClass="w-full"
          class="w-full"
        />
      </div>
      <Button
        type="submit"
        label="Update reports"
        severity="secondary"
        variant="outlined"
        class="justify-self-start"
      />
    </form>
    <QueryStatus
      :pending="insights.query.isPending.value"
      :error="insights.query.error.value"
      :fetching="insights.query.isFetching.value"
      @retry="insights.query.refetch()"
    />
    <template v-if="insights.query.data.value && !insights.query.isError.value">
      <section class="flex flex-col gap-2 border-b border-surface pb-5">
        <h2 class="font-medium">All-time rescue-product savings</h2>
        <p class="text-2xl font-semibold tabular-nums">
          {{ formatCurrency(insights.query.data.value.savings.savings) }}
        </p>
        <p class="text-sm text-muted-color">
          Savings compare rescue-product prices with grade-one prices over completed orders, across
          all dates.
        </p>
      </section>
      <section class="flex min-w-0 flex-col gap-4">
        <h2 class="text-xl font-semibold">Top products for {{ period.month }}/{{ period.year }}</h2>
        <p v-if="!insights.query.data.value.top_products.length">
          No completed-order product activity for this period.
        </p>
        <DataTable
          v-else
          :value="insights.query.data.value.top_products"
          size="small"
          :tableProps="{ 'aria-label': 'Top ordered products' }"
          tableClass="min-w-[34rem]"
          class="min-w-0"
        >
          <Column header="Product"
            ><template #body="{ data }"
              >{{ data.product.name }} · {{ data.grade.name }}</template
            ></Column
          >
          <Column header="Quantity" bodyClass="tabular-nums"
            ><template #body="{ data }">{{ data.total_quantity }}</template></Column
          >
          <Column
            header="Average selling price"
            headerClass="whitespace-nowrap"
            bodyClass="tabular-nums whitespace-nowrap"
            ><template #body="{ data }">{{
              formatCurrency(data.average_selling_price)
            }}</template></Column
          >
          <Column header="Sales" bodyClass="tabular-nums whitespace-nowrap text-right"
            ><template #body="{ data }">{{ formatCurrency(data.total_sales) }}</template></Column
          >
        </DataTable>
      </section>
    </template>
    <section class="flex min-w-0 flex-col gap-4 border-t border-surface pt-6">
      <div class="flex flex-col gap-2">
        <h2 class="text-xl font-semibold">Price history for this period's top products</h2>
        <p class="text-sm text-muted-color">
          Available pricing history may extend beyond the selected month.
        </p>
      </div>
      <QueryStatus
        :pending="trends.query.isPending.value"
        :error="trends.query.error.value"
        @retry="trends.query.refetch()"
      />
      <div
        v-if="trends.query.data.value && !trends.query.isError.value"
        class="grid min-w-0 gap-6 md:grid-cols-2"
      >
        <PriceTrend v-for="(trend, index) in trends.query.data.value" :key="index" :trend="trend" />
        <p v-if="!trends.query.data.value.length">No price trends available.</p>
      </div>
    </section>
  </div>
</template>
