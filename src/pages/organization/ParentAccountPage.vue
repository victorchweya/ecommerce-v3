<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import Button from 'primevue/button'
import Message from 'primevue/message'
import BranchSelector from '@/components/organization/BranchSelector.vue'
import CompanyContext from '@/components/organization/CompanyContext.vue'
import { useOrganization } from '@/composables/organization/useOrganization'
import { useOrganizationStore } from '@/stores/organization'
import { safeReturnTo, errorMessage } from '@/utils/auth'
const router = useRouter()
const route = useRoute()
const organization = useOrganizationStore()
const { branches, selectBranch, selectionError, ready } = useOrganization()
const { data, isFetching, error, refetch } = branches
function proceed() {
  if (!ready.value) return
  const target = safeReturnTo(route.query.returnTo)
  void router.push(router.resolve(target).name === 'parentAccount' ? '/' : target)
}
</script>

<template>
  <section aria-labelledby="branch-heading" class="flex w-full max-w-xl flex-col gap-6">
    <h1 id="branch-heading" class="text-2xl font-semibold">Choose a branch</h1>
    <p>Select the branch you want to shop for.</p>
    <template v-if="error">
      <Message severity="error">{{ errorMessage(error) }}</Message>
      <Button label="Retry branches" class="self-start" severity="secondary" @click="refetch()" />
    </template>
    <template v-else>
      <p v-if="isFetching" role="status">Loading branches…</p>
      <p v-else-if="!data?.length" role="status">
        No branches are available for this account. Please contact our team.
      </p>
      <BranchSelector
        v-else
        :branches="data"
        :selected-id="organization.selectedBranchId"
        :pending="isFetching"
        input-id="parent-branch"
        @select="selectBranch"
      />
    </template>
    <Message v-if="selectionError" severity="error">{{ selectionError }}</Message>
    <CompanyContext v-if="organization.selectedBranchId" />
    <Button label="Continue" :disabled="!ready" class="self-start" @click="proceed" />
  </section>
</template>
