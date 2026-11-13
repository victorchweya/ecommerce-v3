<script setup lang="ts">
import { computed } from 'vue'
import { decimalSchema } from '@/types/catalog'
import { useOrganization } from '@/composables/organization/useOrganization'
import { formatCurrency } from '@/lib/currency'
import AccountLayout from '@/layouts/AccountLayout.vue'
const { company } = useOrganization()
const metrics = computed(() =>
  [
    { key: 'total_kgs_rescued', label: 'Food rescued', unit: 'kg' },
    { key: 'total_co2e_tonnes_avoided', label: 'CO₂e avoided', unit: 'tonnes' },
    { key: 'total_income_to_farmers', label: 'Income to farmers', unit: 'KES' },
  ].map((metric) => {
    const result = decimalSchema.safeParse(company.data.value?.[metric.key])
    return { ...metric, value: result.success ? result.data : null }
  }),
)
</script>
<template>
  <AccountLayout
    ><h1 class="text-2xl font-semibold tabular-nums">Impact dashboard</h1>
    <p class="text-muted-color">Recorded impact for your selected company.</p>
    <div class="@container">
      <dl class="grid gap-5 @2xl:grid-cols-3">
        <div
          v-for="(metric, index) in metrics"
          :key="metric.key"
          class="flex min-w-0 flex-col gap-3"
          :class="
            index
              ? 'border-t border-surface pt-5 @2xl:border-l @2xl:border-t-0 @2xl:pl-6 @2xl:pt-0'
              : ''
          "
        >
          <dt class="truncate font-medium">{{ metric.label }}</dt>
          <dd class="text-2xl font-semibold tabular-nums">
            {{
              metric.value == null
                ? 'Not available'
                : metric.unit === 'KES'
                  ? formatCurrency(metric.value)
                  : `${metric.value.toLocaleString()} ${metric.unit}`
            }}
          </dd>
        </div>
      </dl>
    </div></AccountLayout
  >
</template>
