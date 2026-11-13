<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'
import Button from 'primevue/button'
import Drawer from 'primevue/drawer'
import { useDrawerFocus } from '@/composables/shared/useDrawerFocus'
import Message from 'primevue/message'
import { fetchAddresses, createAddress, updateAddress, deleteAddress } from '@/api/addresses'
import { useCommerceQuery } from '@/composables/shared/useCommerceQuery'
import { useCommerceMutation } from '@/composables/shared/useCommerceMutation'
import type { Address, DeliveryAddressInput } from '@/types/addresses'
import DeliveryAddressForm from '@/components/organization/DeliveryAddressForm.vue'
import QueryStatus from '@/components/shared/QueryStatus.vue'
const { query, company, key } = useCommerceQuery(
  () => ['addresses'],
  (target, signal) => fetchAddresses(target.token, target.branchId, signal),
)
const { rememberTrigger, restoreFocus } = useDrawerFocus()
const editing = shallowRef<Address | 'new' | null>(null)
const confirming = shallowRef<number | null>(null)
const notice = ref('')
const ownAddresses = computed(
  () =>
    query.data.value?.filter(
      (address) =>
        address.company_id === company.data.value?.id && address.address_type !== 'pickup',
    ) ?? [],
)
const save = useCommerceMutation(
  async (target, input: { id: number | null; values: DeliveryAddressInput }) =>
    input.id
      ? updateAddress(target, input.id, input.values)
      : createAddress(target.token, target.branchId, input.values),
  () => {
    finishEditing()
    notice.value = 'Delivery address saved.'
  },
)
const remove = useCommerceMutation(deleteAddress, () => {
  confirming.value = null
  notice.value = 'Delivery address removed.'
})
const makeDefault = useCommerceMutation(
  (target, id: number) => updateAddress(target, id, { is_default: true }),
  () => {
    notice.value = 'Default delivery address updated.'
  },
)
function openEditor(value: Address | 'new', event: Event) {
  rememberTrigger(event)
  editing.value = value
}
function closeEditor(visible: boolean) {
  if (!visible && !save.feedback.value.pending) finishEditing()
}
function finishEditing() {
  // Let PrimeVue Forms process the final field change before unregistering it.
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
  editing.value = null
}
</script>
<template>
  <div class="flex min-w-0 flex-col gap-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <p class="text-muted-color">Manage delivery locations for your selected company.</p>
      <Button
        v-if="query.data.value && !query.isError.value"
        label="Add delivery address"
        :disabled="save.feedback.value.pending"
        @click="openEditor('new', $event)"
      />
    </div>
    <QueryStatus
      :pending="query.isPending.value"
      :error="query.error.value"
      :fetching="query.isFetching.value"
      @retry="query.refetch()"
    />
    <p v-if="notice" role="status">{{ notice }}</p>
    <Message
      v-if="remove.feedback.value.error || makeDefault.feedback.value.error"
      severity="error"
      >{{ remove.feedback.value.error || makeDefault.feedback.value.error }}</Message
    >
    <template v-if="query.data.value && !query.isError.value">
      <p v-if="!ownAddresses.length">You have no saved delivery addresses.</p>
      <ul
        role="list"
        aria-label="Saved delivery addresses"
        class="grid items-start gap-5 md:grid-cols-2"
      >
        <li
          v-for="address in ownAddresses"
          :key="address.id"
          class="flex min-w-0 flex-col gap-4 rounded-border border border-surface p-5"
        >
          <h2 class="font-semibold">
            {{ address.name }} <span v-if="address.is_default">(Default)</span>
          </h2>
          <div class="flex flex-col gap-1">
            <p>{{ [address.address, address.city].filter(Boolean).join(', ') }}</p>
            <p class="text-sm text-muted-color">{{ address.contact_person_name }}</p>
            <p class="text-sm text-muted-color">{{ address.contact_person_phone }}</p>
          </div>
          <div class="flex flex-wrap items-center gap-2 pt-3">
            <Button
              label="Edit address"
              severity="secondary"
              variant="outlined"
              size="small"
              :disabled="save.feedback.value.pending || remove.feedback.value.pending"
              @click="openEditor(address, $event)"
            />
            <Button
              v-if="!address.is_default"
              label="Make default"
              severity="secondary"
              variant="text"
              size="small"
              :disabled="
                makeDefault.feedback.value.pending ||
                remove.feedback.value.pending ||
                save.feedback.value.pending
              "
              @click="makeDefault.save(address.id)"
            />
            <Button
              label="Delete address"
              severity="danger"
              variant="text"
              size="small"
              :disabled="remove.feedback.value.pending || save.feedback.value.pending"
              @click="confirming = address.id"
            />
          </div>
          <div
            v-if="confirming === address.id"
            class="flex flex-col gap-3 border-t border-surface pt-3"
          >
            <p>Delete this delivery address?</p>
            <div class="flex flex-wrap gap-2">
              <Button
                label="Confirm delete"
                severity="danger"
                :disabled="remove.feedback.value.pending"
                @click="remove.save(address.id)"
              />
              <Button
                label="Keep address"
                severity="secondary"
                variant="text"
                @click="confirming = null"
              />
            </div>
          </div>
        </li>
      </ul>
    </template>
    <Drawer
      :visible="editing !== null"
      position="right"
      :header="editing === 'new' ? 'New delivery address' : 'Edit delivery address'"
      :aria-label="editing === 'new' ? 'New delivery address' : 'Edit delivery address'"
      class="w-full sm:w-[36rem]"
      :dismissable="!save.feedback.value.pending"
      :closeOnEscape="!save.feedback.value.pending"
      :showCloseIcon="!save.feedback.value.pending"
      @update:visible="closeEditor"
      @after-hide="restoreFocus"
    >
      <div
        v-if="editing && company.data.value"
        :key="`${key}:${editing === 'new' ? 'new' : editing.id}`"
        class="flex min-w-0 flex-col gap-5"
      >
        <DeliveryAddressForm
          :company="company.data.value"
          :initial-address="editing === 'new' ? undefined : editing"
          :make-default="editing === 'new' ? !ownAddresses.length : Boolean(editing.is_default)"
          action-label="Save delivery address"
          compact-action
          v-bind="save.feedback.value"
          @submit="save.save({ id: editing === 'new' ? null : editing!.id, values: $event })"
        />
        <Button
          label="Cancel address changes"
          severity="secondary"
          variant="text"
          class="self-start"
          :disabled="save.feedback.value.pending"
          @click="finishEditing"
        />
      </div>
    </Drawer>
  </div>
</template>
