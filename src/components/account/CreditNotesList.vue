<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Paginator from 'primevue/paginator'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import { useMediaQuery } from '@vueuse/core'
import { fetchCreditNotes } from '@/api/account'
import { useCommerceQuery } from '@/composables/shared/useCommerceQuery'
import { formatCurrency } from '@/lib/currency'
import QueryStatus from '@/components/shared/QueryStatus.vue'
const desktop = useMediaQuery('(min-width: 768px)')
const route = useRoute()
const router = useRouter()
const page = computed(() => Math.max(1, Number(route.query.page) || 1))
const search = computed(() => (typeof route.query.search === 'string' ? route.query.search : ''))
const draft = ref(search.value)
watch(search, (value) => {
  draft.value = value
})
const { query } = useCommerceQuery(
  () => ['credit-notes', page.value, search.value],
  (target, signal) => fetchCreditNotes(target, page.value, search.value, signal),
)
</script>
<template>
  <div class="flex min-w-0 flex-col gap-5">
    <p class="text-muted-color">Find credit notes and view the details of each adjustment.</p>
    <form
      class="flex flex-col gap-3 border-b border-surface pb-5 sm:flex-row sm:items-end"
      @submit.prevent="router.replace({ query: draft.trim() ? { search: draft.trim() } : {} })"
    >
      <div class="flex min-w-0 flex-1 flex-col gap-2">
        <label for="credit-note-search">Credit note reference</label>
        <InputText
          id="credit-note-search"
          name="search"
          v-model="draft"
          type="search"
          :maxlength="255"
        />
      </div>
      <Button type="submit" label="Search credit notes" severity="secondary" variant="outlined" />
      <Button
        v-if="search"
        type="button"
        label="Clear search"
        severity="secondary"
        variant="text"
        @click="router.replace({ query: {} })"
      />
    </form>
    <QueryStatus
      :pending="query.isPending.value"
      :error="query.error.value"
      :fetching="query.isFetching.value"
      @retry="query.refetch()"
    />
    <template v-if="query.data.value && !query.isError.value">
      <p v-if="!query.data.value.data.length">No credit notes found.</p>
      <DataTable
        v-else-if="desktop"
        :value="query.data.value.data"
        dataKey="id"
        size="small"
        :tableProps="{ 'aria-label': 'Credit notes' }"
        tableClass="min-w-[32rem]"
        class="min-w-0"
      >
        <Column header="Reference"
          ><template #body="{ data }"
            ><RouterLink :to="`/account/credit-notes/${data.id}`" class="font-medium underline">{{
              data.reference
            }}</RouterLink></template
          ></Column
        >
        <Column header="Issued"
          ><template #body="{ data }"
            ><p class="whitespace-nowrap tabular-nums">
              {{ data.date?.slice(0, 10) ?? 'Not available' }}
            </p></template
          ></Column
        >
        <Column header="Status"
          ><template #body="{ data }"><Tag :value="data.status" severity="secondary" /></template
        ></Column>
        <Column header="Amount" bodyClass="text-right tabular-nums whitespace-nowrap"
          ><template #body="{ data }">{{ formatCurrency(data.amount) }}</template></Column
        >
      </DataTable>
      <ul v-else role="list" aria-label="Credit notes" class="flex flex-col">
        <li
          v-for="note in query.data.value.data"
          :key="note.id"
          class="flex flex-col gap-3 border-b border-surface py-4 first:pt-0"
        >
          <div class="flex flex-wrap items-center justify-between gap-3">
            <RouterLink :to="`/account/credit-notes/${note.id}`" class="font-semibold underline">{{
              note.reference
            }}</RouterLink>
            <p class="font-semibold tabular-nums">{{ formatCurrency(note.amount) }}</p>
          </div>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-muted-color tabular-nums">
              {{ note.date?.slice(0, 10) ?? 'Not available' }}
            </p>
            <Tag :value="note.status" severity="secondary" />
          </div>
        </li>
      </ul>
      <Paginator
        v-if="query.data.value.total > 15"
        :first="(page - 1) * 15"
        :rows="15"
        :totalRecords="query.data.value.total"
        @page="router.push({ query: { ...route.query, page: $event.page + 1 } })"
      />
    </template>
  </div>
</template>
