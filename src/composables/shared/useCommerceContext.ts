import { computed, onScopeDispose, watch } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useOrganizationStore } from '@/stores/organization'
import { useOrganization } from '@/composables/organization/useOrganization'
import { useSession } from '@/composables/auth/useSession'
import type { CommerceTarget } from '@/queries/context'
export function useCommerceContext() {
  const auth = useAuthStore()
  const organization = useOrganizationStore()
  const { company, ready, isParent } = useOrganization()
  const { profile, homeCompany } = useSession()
  const branchId = computed(() => (isParent.value ? organization.selectedBranchId : null))
  const key = computed(() => `${auth.revision}:${branchId.value}:${company.data.value?.id}`)
  let generation = 0
  let active = true
  let leaving = false
  onBeforeRouteLeave(() => {
    leaving = true
  })
  watch(
    key,
    () => {
      generation++
    },
    { flush: 'sync' },
  )
  onScopeDispose(() => {
    active = false
  })
  const target = (): CommerceTarget => ({
    token: auth.token,
    revision: auth.revision,
    branchId: branchId.value,
    companyId: company.data.value?.id ?? 0,
    generation,
  })
  const current = (value: CommerceTarget) =>
    active &&
    !leaving &&
    value.generation === generation &&
    value.revision === auth.revision &&
    value.branchId === branchId.value &&
    value.companyId === company.data.value?.id
  return { auth, company, profile, homeCompany, ready, branchId, key, target, current }
}
