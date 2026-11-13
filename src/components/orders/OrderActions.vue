<script setup lang="ts">
import { ref, useId } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Message from 'primevue/message'
import { cancelOrder, leaveFeedback } from '@/api/orders'
import { useCommerceMutation } from '@/composables/shared/useCommerceMutation'
import type { Order } from '@/types/orders'
const props = defineProps<{ order: Order }>()
const id = useId()
const reason = ref('')
const content = ref('')
const type = ref('comment')
const notice = ref('')
const cancellation = useCommerceMutation(
  (target, reason: string) => cancelOrder(target, props.order.id, reason),
  () => {
    notice.value = 'Order cancelled.'
    reason.value = ''
  },
)
const feedback = useCommerceMutation(
  (target, input: { type: string; content: string }) =>
    leaveFeedback(target, props.order.id, input),
  () => {
    notice.value = 'Feedback sent.'
    content.value = ''
  },
)
</script>
<template>
  <div class="flex flex-col gap-5">
    <p v-if="notice" role="status">{{ notice }}</p>
    <details class="border-t border-surface pt-5" v-if="order.status === 'New Order'">
      <summary class="cursor-pointer font-medium">Cancel this order</summary>
      <form
        class="mt-4 flex max-w-xl flex-col items-start gap-3"
        @submit.prevent="reason.trim() && cancellation.save(reason.trim())"
      >
        <label :for="`${id}-reason`">Cancellation reason</label
        ><InputText
          :id="`${id}-reason`"
          name="cancellation_reason"
          v-model="reason"
          required
          :maxlength="1000"
          :disabled="cancellation.feedback.value.pending"
          fluid
        /><Message v-if="cancellation.feedback.value.error" severity="error">{{
          cancellation.feedback.value.error
        }}</Message
        ><Button
          label="Confirm cancellation"
          type="submit"
          severity="danger"
          :loading="cancellation.feedback.value.pending"
          :disabled="cancellation.feedback.value.pending || !reason.trim()"
        />
      </form>
    </details>
    <section v-if="order.feedback" class="flex flex-col gap-2">
      <h2 class="text-xl font-semibold">Your feedback</h2>
      <p>{{ order.feedback.type }}: {{ order.feedback.customer_feedback }}</p>
    </section>
    <details
      class="border-t border-surface pt-5"
      v-else-if="feedback.homeCompany.value?.id === order.company_id"
    >
      <summary class="cursor-pointer font-medium">Leave order feedback</summary>
      <form
        class="mt-4 flex max-w-xl flex-col gap-3"
        @submit.prevent="content.trim() && feedback.save({ type, content: content.trim() })"
      >
        <label :id="`${id}-type-label`" :for="`${id}-type`">Feedback type</label
        ><Select
          :inputId="`${id}-type`"
          :ariaLabelledby="`${id}-type-label`"
          v-model="type"
          :options="['complaint', 'comment', 'preference', 'compliment']"
          :disabled="feedback.feedback.value.pending"
        /><label :for="`${id}-content`">Your feedback</label
        ><Textarea
          :id="`${id}-content`"
          name="feedback"
          v-model="content"
          required
          rows="4"
          :disabled="feedback.feedback.value.pending"
        /><Message v-if="feedback.feedback.value.error" severity="error">{{
          feedback.feedback.value.error
        }}</Message
        ><Button
          label="Send feedback"
          class="self-start"
          type="submit"
          :loading="feedback.feedback.value.pending"
          :disabled="feedback.feedback.value.pending || !content.trim()"
        />
      </form>
    </details>
    <p v-else class="text-sm text-muted-color">
      For feedback about this branch order,
      <RouterLink to="/contact" class="underline">contact support</RouterLink>.
    </p>
  </div>
</template>
