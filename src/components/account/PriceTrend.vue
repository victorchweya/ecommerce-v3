<script setup lang="ts">
import { computed, useId } from 'vue'
import type { PriceTrend } from '@/types/account'
import { trendPoints } from '@/utils/account/chart'
import { formatCurrency } from '@/lib/currency'
const props = defineProps<{ trend: PriceTrend }>()
const id = useId()
const points = computed(() => trendPoints(props.trend.data))
</script>
<template>
  <section class="flex min-w-0 flex-col gap-3 border-b border-surface pb-5">
    <h3 :id="`${id}-title`" class="font-semibold">{{ trend.product }}</h3>
    <p v-if="!trend.data.length">No pricing history available.</p>
    <template v-else
      ><svg
        viewBox="0 0 300 120"
        role="img"
        :aria-labelledby="`${id}-title ${id}-description`"
        class="h-36 w-full text-primary"
      >
        <desc :id="`${id}-description`">
          Price history, ordered by date. Exact dates and prices are available in the table below.
        </desc>
        <polyline
          v-if="trend.data.length > 1"
          :points="points"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        />
        <circle v-else cx="150" cy="60" r="3" fill="currentColor" />
      </svg>
      <p class="text-sm text-muted-color">
        {{ trend.data[0]?.date }} – {{ trend.data.at(-1)?.date }}
      </p>
      <details>
        <summary class="cursor-pointer">View price history table</summary>
        <div class="max-h-72 overflow-auto">
          <table class="w-full text-left text-sm">
            <caption class="sr-only">
              {{
                trend.product
              }}
              price history
            </caption>
            <thead>
              <tr>
                <th class="p-2">Date</th>
                <th class="p-2">Price</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(point, index) in trend.data" :key="index">
                <td class="p-2">{{ point.date }}</td>
                <td class="p-2">{{ formatCurrency(point.price) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </details></template
    >
  </section>
</template>
