<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import QRCode from 'qrcode'
import Button from 'primevue/button'
import type { Order } from '@/types/orders'
import { safeDocumentUrl } from '@/utils/documents'
import OrderLines from '@/components/orders/OrderLines.vue'
import OrderTotals from '@/components/orders/OrderTotals.vue'
const props = defineProps<{ order: Order }>()
const documentUrl = computed(() => safeDocumentUrl(props.order.invoice_url))
const qr = shallowRef('')
const qrError = shallowRef(false)
watch(
  documentUrl,
  async (value, _previous, onCleanup) => {
    let active = true
    onCleanup(() => {
      active = false
    })
    qr.value = ''
    qrError.value = false
    if (!value) return
    try {
      const image = await QRCode.toDataURL(value, { width: 180, margin: 4 })
      if (active) qr.value = image
    } catch {
      if (active) qrError.value = true
    }
  },
  { immediate: true },
)
function print() {
  window.print()
}
</script>
<template>
  <article class="document flex min-w-0 flex-col gap-6">
    <header class="flex flex-wrap items-start justify-between gap-4 border-b border-surface pb-5">
      <div class="flex flex-col gap-2">
        <h2 class="text-xl font-semibold">Invoice {{ order.order_number }}</h2>
        <p class="text-sm text-muted-color">
          {{ order.payment_status ?? 'Payment status not available' }}
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-3 print:hidden">
        <Button
          label="Print or save invoice as PDF"
          severity="secondary"
          variant="outlined"
          @click="print"
        />
        <a
          v-if="documentUrl"
          :href="documentUrl"
          target="_blank"
          rel="noopener noreferrer"
          referrerpolicy="no-referrer"
          class="underline"
          >Open issued invoice</a
        >
      </div>
    </header>
    <section class="grid gap-5 sm:grid-cols-2">
      <div class="flex min-w-0 flex-col gap-1">
        <h3 class="font-medium">Buyer</h3>
        <p>{{ order.company?.billing_details?.business_name ?? order.company?.name }}</p>
        <p class="text-sm text-muted-color">
          {{ order.company?.billing_details?.address }} {{ order.company?.billing_details?.city }}
          {{ order.company?.billing_details?.postal_code }}
        </p>
        <p class="text-sm text-muted-color">
          PIN:
          {{ order.company?.billing_details?.kra_pin ?? order.company?.kra_pin ?? 'Not available' }}
        </p>
      </div>
      <div class="flex min-w-0 flex-col gap-1">
        <h3 class="font-medium">Supplier</h3>
        <p>Farm to Feed</p>
        <p class="text-sm text-muted-color">PIN: P051913922G</p>
      </div>
    </section>
    <dl class="grid gap-4 border-y border-surface py-4 sm:grid-cols-2">
      <div class="flex flex-col gap-1">
        <dt class="font-medium">Issued</dt>
        <dd class="text-muted-color tabular-nums">
          {{
            order.invoice_issue_date?.slice(0, 10) ??
            order.delivery_date?.slice(0, 10) ??
            'Not available'
          }}
        </dd>
      </div>
      <div class="flex flex-col gap-1">
        <dt class="font-medium">Due</dt>
        <dd class="text-muted-color tabular-nums">
          {{ order.invoice_due_date?.slice(0, 10) ?? 'Not available' }}
        </dd>
      </div>
    </dl>
    <OrderLines :lines="order.order_line_items" invoice />
    <div class="grid items-start gap-6 sm:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
      <div>
        <img v-if="qr" :src="qr" width="180" height="180" alt="QR code for the issued invoice" />
        <p v-if="qrError" class="text-sm text-muted-color">
          The QR code could not be generated. Use the issued-invoice link above.
        </p>
      </div>
      <OrderTotals :order="order" />
    </div>
  </article>
</template>
