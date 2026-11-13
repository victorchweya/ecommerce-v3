<script setup lang="ts">
import Button from 'primevue/button'
import Lock from '@primeicons/vue/lock'
import Message from 'primevue/message'
import { RouterLink, useRouter } from 'vue-router'
import { useSession } from '@/composables/auth/useSession'
import { errorMessage } from '@/utils/auth'
const router = useRouter()
const { profile } = useSession()
const { isFetching, error, refetch } = profile
async function checkApproval() {
  const result = await refetch()
  if (!result.error) await router.replace('/')
}
</script>

<template>
  <section
    aria-labelledby="approval-heading"
    class="flex w-full flex-col items-center gap-6 text-center"
  >
    <Lock class="size-8" aria-hidden="true" />
    <h1 id="approval-heading" class="text-2xl font-semibold">Account awaiting approval</h1>
    <p>
      Your account is awaiting approval. Please contact our team if you need help completing account
      setup.
    </p>
    <Message v-if="error" severity="error">{{ errorMessage(error) }}</Message>
    <Button
      label="Check approval status"
      :loading="isFetching"
      :disabled="isFetching"
      class="self-center"
      @click="checkApproval"
    />
    <RouterLink :to="{ name: 'contactPerson' }" class="self-center underline"
      >Complete account details</RouterLink
    >
    <p class="text-muted-color">You can sign out using the navigation above.</p>
  </section>
</template>
