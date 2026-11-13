import { computed, onScopeDispose, watch } from 'vue'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import { updateCompany } from '@/api/organization'
import { createAddress } from '@/api/addresses'
import { addressesQuery } from '@/queries/addresses'
import { companyQuery } from '@/queries/organization'
import { profileQuery } from '@/queries/auth'
import { useOrganization } from '@/composables/organization/useOrganization'
import { useAuthStore } from '@/stores/auth'
import { useOrganizationStore } from '@/stores/organization'
import { ApiError } from '@/lib/api'
import { replaceSession } from './session'
import { safeReturnTo, isPublicRoute } from '@/utils/auth'
import type { CompanyUpdate } from '@/types/organization'
import type { DeliveryAddressInput } from '@/types/addresses'

export type OnboardingStep = 'contact' | 'billing' | 'delivery'
type Target = {
  generation: number
  token: string
  revision: number
  branchId: number | null
  companyId: number
}
type Save = { target: Target } & (
  { kind: 'company'; input: CompanyUpdate } | { kind: 'address'; input: DeliveryAddressInput }
)
export function useOnboarding(step: OnboardingStep) {
  const auth = useAuthStore()
  const organization = useOrganizationStore()
  const router = useRouter()
  const route = useRoute()
  const client = useQueryClient()
  const { company, isParent, selectedBranch } = useOrganization({ allowPending: true })
  let generation = 0
  let active = true
  onBeforeRouteLeave(() => {
    active = false
  })
  onScopeDispose(() => {
    active = false
  })
  const branchId = computed(() => (isParent.value ? organization.selectedBranchId : null))
  const contextKey = computed(() => `${auth.revision}:${branchId.value}:${company.data.value?.id}`)
  const addresses = useQuery(
    computed(() => ({
      ...addressesQuery(auth.token, auth.revision, branchId.value),
      enabled:
        step === 'delivery' &&
        Boolean(company.data.value) &&
        !company.isError.value &&
        (!isParent.value || Boolean(selectedBranch.value)),
    })),
  )
  const savedAddresses = computed(
    () =>
      addresses.data.value?.filter((address) => address.company_id === company.data.value?.id) ??
      [],
  )
  function stillCurrent(target: Target) {
    return (
      active &&
      target.generation === generation &&
      auth.revision === target.revision &&
      branchId.value === target.branchId
    )
  }
  async function next() {
    await router.push(
      step === 'contact'
        ? { name: 'billingDetails' }
        : step === 'billing'
          ? { name: 'deliveryAddress' }
          : { name: 'home' },
    )
  }
  const mutation = useMutation({
    mutationFn: async (action: Save) => {
      const { token, branchId, companyId } = action.target
      if (action.kind === 'address') {
        const address = await createAddress(token, branchId, action.input)
        if (address.company_id !== companyId)
          throw new Error('Unexpected company in address response.')
        return address
      }
      const company = await updateCompany(token, branchId, action.input)
      if (company.id !== companyId) throw new Error('Unexpected company in update response.')
      return company
    },
    async onSuccess(_result, action) {
      if (auth.revision !== action.target.revision) return
      const { token, revision, branchId } = action.target
      if (action.kind === 'company') {
        await client.invalidateQueries({
          queryKey: companyQuery(token, revision, branchId).queryKey,
        })
        if (branchId === null)
          await client.invalidateQueries({ queryKey: profileQuery(token, revision).queryKey })
      } else {
        await client.invalidateQueries({
          queryKey: addressesQuery(token, revision, branchId).queryKey,
        })
      }
      if (stillCurrent(action.target)) await next()
    },
    onError(error, action) {
      if (
        auth.token &&
        auth.revision === action.target.revision &&
        error instanceof ApiError &&
        error.status === 401
      ) {
        const returnTo = safeReturnTo(route.fullPath)
        replaceSession('')
        auth.notice = 'Your session expired. Please sign in again.'
        if (!route.meta.passwordRecovery && !isPublicRoute(route))
          void router.replace({ name: 'login', query: { returnTo } })
      }
    },
  })
  watch(
    [() => auth.revision, branchId],
    () => {
      generation++
      mutation.reset()
    },
    { flush: 'sync' },
  )
  function save(
    action:
      | Omit<Extract<Save, { kind: 'company' }>, 'target'>
      | Omit<Extract<Save, { kind: 'address' }>, 'target'>,
  ) {
    if (
      mutation.isPending.value ||
      !company.data.value ||
      company.isError.value ||
      (isParent.value && !selectedBranch.value)
    )
      return
    mutation.mutate({
      ...action,
      target: {
        generation,
        token: auth.token,
        revision: auth.revision,
        branchId: branchId.value,
        companyId: company.data.value.id,
      },
    })
  }
  return { company, addresses, savedAddresses, mutation, contextKey, save, next }
}
