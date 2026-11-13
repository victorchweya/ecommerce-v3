<script setup lang="ts">
import { useMediaQuery } from '@vueuse/core'
import type { OrderLine } from '@/types/orders'
import { formatCurrency } from '@/lib/currency'
defineProps<{ lines: OrderLine[]; invoice?: boolean }>()
const desktop = useMediaQuery('(min-width: 768px)')
</script>
<template>
  <div v-if="invoice || desktop" class="min-w-0 overflow-x-auto print:overflow-visible">
    <table class="w-full min-w-[32rem] text-left text-sm print:min-w-0">
      <caption class="sr-only">
        Order items
      </caption>
      <thead>
        <tr class="border-b border-surface">
          <th scope="col" class="pb-3 pr-4 whitespace-nowrap font-medium text-muted-color">
            Product and options
          </th>
          <th
            scope="col"
            class="px-3 pb-3 whitespace-nowrap text-right font-medium text-muted-color"
          >
            Quantity
          </th>
          <th
            scope="col"
            class="px-3 pb-3 whitespace-nowrap text-right font-medium text-muted-color"
          >
            Unit price
          </th>
          <th
            scope="col"
            class="pb-3 pl-3 whitespace-nowrap text-right font-medium text-muted-color"
          >
            Line amount
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="line in lines" :key="line.id" class="border-b border-surface">
          <td class="py-4 pr-4">
            <p class="font-medium">
              {{ line.unit_variant?.grade_variant?.product?.name ?? `Item ${line.id}`
              }}<template v-if="line.unit_variant?.grade_variant?.grade?.name">
                · {{ line.unit_variant.grade_variant.grade.name }}</template
              >
            </p>
            <p v-if="line.processing_type || line.specifications" class="text-muted-color">
              {{ [line.processing_type, line.specifications].filter(Boolean).join(' · ') }}
            </p>
          </td>
          <td class="px-3 py-4 whitespace-nowrap text-right tabular-nums">
            {{ invoice ? (line.quantity_dispatched ?? 0) : line.order_quantity }}
            {{ line.unit_variant?.unit?.name }}
          </td>
          <td class="px-3 py-4 whitespace-nowrap text-right tabular-nums">
            {{ formatCurrency(line.selling_price) }}
          </td>
          <td class="py-4 pl-3 whitespace-nowrap text-right font-medium tabular-nums">
            {{
              formatCurrency(
                (invoice ? (line.quantity_dispatched ?? 0) : line.order_quantity) *
                  line.selling_price,
              )
            }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
  <ul v-else role="list" aria-label="Order items" class="flex min-w-0 flex-col">
    <li
      v-for="line in lines"
      :key="line.id"
      class="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 border-b border-surface py-4 first:pt-0"
    >
      <div class="flex min-w-0 flex-col gap-1">
        <p class="font-medium [overflow-wrap:anywhere]">
          {{ line.unit_variant?.grade_variant?.product?.name ?? `Item ${line.id}`
          }}<template v-if="line.unit_variant?.grade_variant?.grade?.name">
            · {{ line.unit_variant.grade_variant.grade.name }}</template
          >
        </p>
        <p class="text-sm text-muted-color tabular-nums">
          {{ formatCurrency(line.selling_price) }} / {{ line.unit_variant?.unit?.name ?? 'unit' }}
        </p>
        <p v-if="line.processing_type || line.specifications" class="text-sm text-muted-color">
          {{ [line.processing_type, line.specifications].filter(Boolean).join(' · ') }}
        </p>
        <p class="tabular-nums">{{ line.order_quantity }} {{ line.unit_variant?.unit?.name }}</p>
      </div>
      <p class="text-right font-medium tabular-nums">
        <span class="sr-only">Line amount: </span
        >{{ formatCurrency(line.order_quantity * line.selling_price) }}
      </p>
    </li>
  </ul>
</template>
