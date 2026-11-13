<script setup lang="ts">
import { shallowRef } from 'vue'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import Message from 'primevue/message'
import { fetchStaff, fetchInvitations, inviteStaff, cancelInvitation } from '@/api/account'
import { useCommerceQuery } from '@/composables/shared/useCommerceQuery'
import { useCommerceMutation } from '@/composables/shared/useCommerceMutation'
import QueryStatus from '@/components/shared/QueryStatus.vue'
import StaffInvitationDialog from './StaffInvitationDialog.vue'
import { useDrawerFocus } from '@/composables/shared/useDrawerFocus'
const inviteOpen = shallowRef(false)
const notice = shallowRef('')
const { rememberTrigger, restoreFocus } = useDrawerFocus()
const staff = useCommerceQuery(
  () => ['staff'],
  fetchStaff,
  () => true,
  true,
)
const invitations = useCommerceQuery(
  () => ['staff-invitations'],
  fetchInvitations,
  () => true,
  true,
)
const invite = useCommerceMutation(
  inviteStaff,
  () => {
    inviteOpen.value = false
    notice.value = 'Invitation sent.'
  },
  true,
)
const cancellation = useCommerceMutation(
  cancelInvitation,
  () => {
    notice.value = 'Invitation cancelled.'
  },
  true,
)
function openInvite(event: Event) {
  rememberTrigger(event)
  invite.mutation.reset()
  notice.value = ''
  inviteOpen.value = true
}
</script>
<template>
  <section class="flex min-w-0 flex-col gap-6">
    <header class="flex flex-col gap-3">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-xl font-semibold">Company team</h2>
        <Button
          label="Invite member"
          type="button"
          aria-controls="staff-invitation-dialog"
          :aria-expanded="inviteOpen"
          :disabled="!staff.ready.value || cancellation.feedback.value.pending"
          @click="openInvite"
        />
      </div>
      <p class="text-sm text-muted-color">
        Team access belongs to your home company, {{ staff.homeCompany.value?.name }}.
      </p>
    </header>
    <Message v-if="notice" severity="success" role="status">{{ notice }}</Message>
    <section aria-labelledby="team-members-title" class="flex min-w-0 flex-col gap-3">
      <h3 id="team-members-title" class="font-medium">
        Members<span v-if="staff.query.data.value && !staff.query.isError.value">
          ({{ staff.query.data.value.length }})</span
        >
      </h3>
      <QueryStatus
        :pending="staff.query.isPending.value"
        :error="staff.query.error.value"
        @retry="staff.query.refetch()"
      />
      <ul
        v-if="staff.query.data.value && !staff.query.isError.value"
        role="list"
        aria-label="Company members"
        class="flex flex-col border-t border-surface"
      >
        <li
          v-for="user in staff.query.data.value"
          :key="user.id"
          class="flex flex-wrap items-center gap-3 border-b border-surface py-4"
        >
          <Avatar
            :label="user.name.charAt(0).toUpperCase()"
            shape="circle"
            aria-hidden="true"
            class="shrink-0"
          />
          <div class="min-w-0 flex-1">
            <p class="font-medium [overflow-wrap:anywhere]">{{ user.name }}</p>
            <p class="text-sm text-muted-color [overflow-wrap:anywhere]">{{ user.email }}</p>
          </div>
          <p
            v-if="user.customer?.designation"
            class="text-sm text-muted-color [overflow-wrap:anywhere]"
          >
            {{ user.customer.designation }}
          </p>
        </li>
      </ul>
      <p
        v-if="staff.query.data.value?.length === 0 && !staff.query.isError.value"
        class="text-sm text-muted-color"
      >
        No team members to display.
      </p>
    </section>
    <section aria-labelledby="team-invitations-title" class="flex min-w-0 flex-col gap-3">
      <h3 id="team-invitations-title" class="font-medium">Pending invitations</h3>
      <QueryStatus
        :pending="invitations.query.isPending.value"
        :error="invitations.query.error.value"
        @retry="invitations.query.refetch()"
      />
      <Message v-if="cancellation.feedback.value.error" severity="error">{{
        cancellation.feedback.value.error
      }}</Message>
      <div
        v-if="invitations.query.data.value && !invitations.query.isError.value"
        class="flex flex-col gap-3"
      >
        <p v-if="!invitations.query.data.value.length" class="text-sm text-muted-color">
          No pending invitations.
        </p>
        <ul
          v-if="invitations.query.data.value.length"
          role="list"
          aria-label="Pending invitations"
          class="flex flex-col border-t border-surface"
        >
          <li
            v-for="invitation in invitations.query.data.value"
            :key="invitation.id"
            class="flex flex-col gap-2 border-b border-surface py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
          >
            <div class="min-w-0">
              <p class="[overflow-wrap:anywhere]">{{ invitation.email }}</p>
              <p class="text-sm text-muted-color">
                Expires {{ invitation.expires_at?.slice(0, 10) ?? 'Not available' }}
              </p>
            </div>
            <Button
              label="Cancel invitation"
              :aria-label="`Cancel invitation for ${invitation.email}`"
              type="button"
              severity="secondary"
              variant="text"
              size="small"
              class="self-start sm:shrink-0 sm:self-center"
              :disabled="cancellation.feedback.value.pending || invite.feedback.value.pending"
              @click="cancellation.save(invitation.id)"
            />
          </li>
        </ul>
      </div>
    </section>
    <StaffInvitationDialog
      v-model:visible="inviteOpen"
      :company-name="staff.homeCompany.value?.name"
      :pending="invite.feedback.value.pending"
      :error="invite.feedback.value.error"
      @submit="invite.save"
      @after-hide="restoreFocus"
    />
  </section>
</template>
