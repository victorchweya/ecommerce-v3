<script setup lang="ts">
import AccountLayout from '@/layouts/AccountLayout.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { fetchOrder } from '@/api/orders'
import { fetchPublicInvoice } from '@/api/documents'
import { commerceQuery } from '@/queries/context'
import { useCommerceContext } from '@/composables/shared/useCommerceContext'
import QueryStatus from '@/components/shared/QueryStatus.vue'
import InvoiceDocument from '@/components/account/InvoiceDocument.vue'
import { invoiceAvailable } from '@/utils/checkout/rules'
const route = useRoute()
const context = useCommerceContext()
const id = computed(() => Number(route.params.id))
const signature = computed(() =>
  typeof route.query.signature === 'string' ? route.query.signature : '',
)
const query = useQuery(
  computed(() =>
    signature.value
      ? {
          queryKey: ['public-document', 'Invoice', id.value, signature.value],
          queryFn: ({ signal }: { signal: AbortSignal }) =>
            fetchPublicInvoice(
              id.value,
              signature.value,
              AbortSignal.any([signal, AbortSignal.timeout(20_000)]),
            ),
          retry: false,
          staleTime: 60_000,
          refetchOnWindowFocus: false,
        }
      : {
          ...commerceQuery(context.target(), ['orders', id.value], (target, signal) =>
            fetchOrder(target, id.value, signal),
          ),
          enabled: context.ready.value && Number.isSafeInteger(id.value) && id.value > 0,
        },
  ),
)
</script>
<template>
  <component :is="signature ? 'section' : AccountLayout"
    ><section class="flex min-w-0 flex-col gap-6">
      <h1 class="text-2xl font-semibold">Invoice</h1>
      <QueryStatus
        :pending="query.isPending.value"
        :error="query.error.value"
        :fetching="query.isFetching.value"
        @retry="query.refetch()"
      /><InvoiceDocument
        v-if="query.data.value && !query.isError.value && invoiceAvailable(query.data.value)"
        :order="query.data.value"
      />
      <p v-if="query.data.value && !query.isError.value && !invoiceAvailable(query.data.value)">
        An issued invoice is not yet available for this order.
      </p>
      <RouterLink v-if="!signature" to="/account/invoices" class="self-start underline print:hidden"
        >Back to invoices</RouterLink
      >
    </section></component
  >
</template>
