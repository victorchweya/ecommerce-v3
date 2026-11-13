<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import Drawer from 'primevue/drawer'
import Button from 'primevue/button'
import Bars from '@primeicons/vue/bars'
import { useDrawerFocus } from '@/composables/shared/useDrawerFocus'
import PageBreadcrumb from '@/components/shared/PageBreadcrumb.vue'
import AccountNavigation from '@/components/account/AccountNavigation.vue'
import CompanyContext from '@/components/organization/CompanyContext.vue'
const { rememberTrigger, restoreFocus } = useDrawerFocus()
const open = shallowRef(false)
const route = useRoute()
const titles: Record<string, string> = {
  accountDetails: 'Account details',
  deliveryAddresses: 'Delivery addresses',
  invoices: 'Invoices',
  invoice: 'Invoice',
  creditNote: 'Credit note',
  creditNotes: 'Credit notes',
  orderInsights: 'Order insights',
  impactDashboard: 'Impact dashboard',
  orders: 'Orders',
  order: 'Order details',
  editOrder: 'Edit order',
}
const breadcrumb = computed(() => [
  { label: 'Account', to: '/account' },
  ...(route.name === 'order' || route.name === 'editOrder'
    ? [{ label: 'Orders', to: '/orders' }]
    : []),
  ...(route.name === 'invoice' ? [{ label: 'Invoices', to: '/account/invoices' }] : []),
  ...(route.name === 'creditNote' ? [{ label: 'Credit notes', to: '/account/credit-notes' }] : []),
  { label: titles[String(route.name)] ?? 'Account' },
])
watch(
  () => route.fullPath,
  () => {
    open.value = false
  },
)
function showSections(event: Event) {
  rememberTrigger(event)
  open.value = true
}
</script>
<template>
  <div class="flex min-w-0 flex-col gap-6">
    <PageBreadcrumb :items="breadcrumb" />
    <div class="grid items-start gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] print:block">
      <aside
        class="hidden flex-col gap-5 lg:sticky lg:top-6 border-r border-surface pr-6 lg:flex print:hidden"
      >
        <div class="flex flex-col gap-2">
          <h2 class="text-xl font-semibold">My account</h2>
          <CompanyContext class="text-sm text-muted-color" />
        </div>
        <AccountNavigation />
      </aside>
      <div class="flex min-w-0 flex-col gap-6">
        <div class="flex flex-wrap items-center justify-between gap-3 lg:hidden print:hidden">
          <Button
            label="Account sections"
            severity="secondary"
            variant="outlined"
            aria-controls="account-sections"
            :aria-expanded="open"
            @click="showSections"
            ><Bars aria-hidden="true" />Account sections</Button
          >
          <CompanyContext class="text-sm text-muted-color" />
        </div>
        <slot />
      </div>
    </div>
    <Drawer
      id="account-sections"
      v-model:visible="open"
      @after-hide="restoreFocus"
      header="My account"
      aria-label="Account sections"
      class="w-full sm:w-80"
      ><AccountNavigation @navigate="open = false"
    /></Drawer>
  </div>
</template>
