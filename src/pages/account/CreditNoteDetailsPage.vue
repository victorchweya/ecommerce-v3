<script setup lang="ts">
import AccountLayout from '@/layouts/AccountLayout.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { fetchCreditNote } from '@/api/account'
import { fetchPublicCreditNote } from '@/api/documents'
import { commerceQuery } from '@/queries/context'
import { useCommerceContext } from '@/composables/shared/useCommerceContext'
import QueryStatus from '@/components/shared/QueryStatus.vue'
import CreditNoteDocument from '@/components/account/CreditNoteDocument.vue'
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
          queryKey: ['public-document', 'CreditNote', id.value, signature.value],
          queryFn: ({ signal }: { signal: AbortSignal }) =>
            fetchPublicCreditNote(
              id.value,
              signature.value,
              AbortSignal.any([signal, AbortSignal.timeout(20_000)]),
            ),
          retry: false,
          staleTime: 60_000,
          refetchOnWindowFocus: false,
        }
      : {
          ...commerceQuery(context.target(), ['credit-notes', id.value], (target, signal) =>
            fetchCreditNote(target, id.value, signal),
          ),
          enabled: context.ready.value && Number.isSafeInteger(id.value) && id.value > 0,
        },
  ),
)
</script>
<template>
  <component :is="signature ? 'section' : AccountLayout"
    ><section class="flex min-w-0 flex-col gap-6">
      <h1 class="text-2xl font-semibold">Credit note</h1>
      <QueryStatus
        :pending="query.isPending.value"
        :error="query.error.value"
        :fetching="query.isFetching.value"
        @retry="query.refetch()"
      /><CreditNoteDocument
        v-if="query.data.value && !query.isError.value"
        :note="query.data.value"
      /><RouterLink
        v-if="!signature"
        to="/account/credit-notes"
        class="self-start underline print:hidden"
        >Back to credit notes</RouterLink
      >
    </section></component
  >
</template>
