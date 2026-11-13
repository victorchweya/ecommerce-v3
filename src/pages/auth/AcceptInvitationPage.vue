<script setup lang="ts">
import { computed, watch } from 'vue'
import { useMutation } from '@tanstack/vue-query'
import { RouterLink, useRoute } from 'vue-router'
import Message from 'primevue/message'
import InvitationForm from '@/components/auth/InvitationForm.vue'
import { acceptInvitation } from '@/api/auth'
import { emailSchema } from '@/validation/auth'
import { apiFieldErrors, errorMessage } from '@/utils/auth'
const route = useRoute()
const email = computed(() => (typeof route.query.email === 'string' ? route.query.email : ''))
const token = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''))
const validLink = computed(() => Boolean(token.value) && emailSchema.safeParse(email.value).success)
const { mutate, error, isPending, isSuccess, reset } = useMutation({
  mutationFn: acceptInvitation,
  gcTime: 0,
})
watch([email, token], () => reset())
</script>
<template>
  <section aria-labelledby="invitation-heading" class="flex w-full flex-col gap-6">
    <h1 id="invitation-heading" class="text-2xl font-semibold">Accept invitation</h1>
    <Message v-if="isSuccess" severity="success"
      >Invitation accepted. Sign in to continue setting up your account.</Message
    >
    <InvitationForm
      v-else-if="validLink"
      :key="token + email"
      :email="email"
      :token="token"
      :pending="isPending"
      :error="error ? errorMessage(error) : ''"
      :field-errors="apiFieldErrors(error)"
      @submit="mutate"
    />
    <Message v-else severity="error"
      >This invitation link is incomplete. Please ask the sender for a new link.</Message
    >
    <RouterLink :to="{ name: 'login' }" class="underline">Back to sign in</RouterLink>
  </section>
</template>
