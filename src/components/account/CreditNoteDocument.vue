<script setup lang="ts">
import Button from 'primevue/button'
import type { CreditNote } from '@/types/account'
import { formatCurrency } from '@/lib/currency'
defineProps<{ note: CreditNote }>()
function print() {
  window.print()
}
</script>
<template>
  <article class="document flex min-w-0 flex-col gap-6">
    <header class="flex flex-wrap items-start justify-between gap-4 border-b border-surface pb-5">
      <div class="flex flex-col gap-2">
        <h2 class="text-xl font-semibold">{{ note.reference }}</h2>
        <p class="text-muted-color">{{ note.company?.name }}</p>
      </div>
      <Button
        label="Print or save credit note as PDF"
        severity="secondary"
        variant="outlined"
        class="print:hidden"
        @click="print"
      />
    </header>
    <dl class="grid gap-4 sm:grid-cols-3">
      <div class="flex flex-col gap-1">
        <dt class="font-medium">Issued</dt>
        <dd class="text-muted-color tabular-nums">
          {{ note.date?.slice(0, 10) ?? 'Not available' }}
        </dd>
      </div>
      <div class="flex flex-col gap-1">
        <dt class="font-medium">Status</dt>
        <dd class="text-muted-color">{{ note.status }}</dd>
      </div>
      <div v-if="note.order" class="flex flex-col gap-1">
        <dt class="font-medium">Order</dt>
        <dd class="text-muted-color">{{ note.order.order_number }}</dd>
      </div>
    </dl>
    <p v-if="note.description">{{ note.description }}</p>
    <div class="min-w-0 overflow-x-auto print:overflow-visible">
      <table class="w-full min-w-[30rem] text-left text-sm print:min-w-0">
        <caption class="sr-only">
          Credit note items
        </caption>
        <thead>
          <tr class="border-b border-surface">
            <th scope="col" class="pb-3 pr-4 whitespace-nowrap font-medium text-muted-color">
              Item
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
              Price
            </th>
            <th
              scope="col"
              class="pb-3 pl-3 whitespace-nowrap text-right font-medium text-muted-color"
            >
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in note.items" :key="item.id" class="border-b border-surface">
            <td class="py-4 pr-4 font-medium">
              {{ item.line_item?.unit_variant?.grade_variant?.product?.name ?? `Item ${item.id}` }}
            </td>
            <td class="px-3 py-4 text-right tabular-nums">{{ item.quantity }}</td>
            <td class="px-3 py-4 whitespace-nowrap text-right tabular-nums">
              {{ formatCurrency(item.price) }}
            </td>
            <td class="py-4 pl-3 whitespace-nowrap text-right tabular-nums">
              {{ formatCurrency(item.amount) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <dl class="ml-auto flex w-full max-w-sm flex-col gap-3 tabular-nums">
      <div v-if="note.total_tax != null" class="flex justify-between gap-3">
        <dt>Included VAT</dt>
        <dd>{{ formatCurrency(note.total_tax) }}</dd>
      </div>
      <div class="flex justify-between gap-3 border-t border-surface pt-3 font-semibold">
        <dt>Total credit</dt>
        <dd>{{ formatCurrency(note.amount) }}</dd>
      </div>
    </dl>
  </article>
</template>
