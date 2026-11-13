import { computed, ref } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { useSession } from '@/composables/auth/useSession'
import { branchesQuery, companyQuery } from '@/queries/organization'
import { useAuthStore } from '@/stores/auth'
import { useOrganizationStore } from '@/stores/organization'
import { errorMessage } from '@/utils/auth'

export function useOrganization(options: { allowPending?: boolean } = {}) {
  const auth = useAuthStore()
  const organization = useOrganizationStore()
  const client = useQueryClient()
  const { isParent, access } = useSession()
  const selectionError = ref('')
  const branches = useQuery(
    computed(() => ({
      ...branchesQuery(auth.token, auth.revision),
      enabled: Boolean(auth.token) && isParent.value && access.value === 'active',
    })),
  )
  const selectedBranch = computed(() =>
    branches.data.value?.find((branch) => branch.id === organization.selectedBranchId),
  )
  const company = useQuery(
    computed(() => ({
      ...companyQuery(
        auth.token,
        auth.revision,
        isParent.value ? organization.selectedBranchId : null,
      ),
      enabled:
        Boolean(auth.token) &&
        (access.value === 'active' ||
          (Boolean(options.allowPending) && access.value === 'pending')) &&
        (!isParent.value || Boolean(selectedBranch.value)),
    })),
  )
  function selectBranch(id: number) {
    selectionError.value = ''
    if (!branches.data.value?.some((branch) => branch.id === id)) {
      selectionError.value = 'Choose an available branch.'
      return
    }
    if (organization.selectedBranchId === id) return
    // All acting-company queries use this prefix; cancelled responses cannot repopulate the old context.
    void client.cancelQueries({ queryKey: ['branch'] })
    client.removeQueries({ queryKey: ['branch'] })
    organization.selectBranch(id)
  }
  const companyError = computed(() => {
    if (company.error.value) return errorMessage(company.error.value)
    if (company.data.value && company.data.value.status !== 'active')
      return 'Shopping is unavailable for this company. Please contact our team.'
    return ''
  })
  const ready = computed(
    () =>
      access.value === 'active' &&
      company.data.value?.status === 'active' &&
      !company.isError.value &&
      (!isParent.value || (Boolean(selectedBranch.value) && !branches.isError.value)),
  )
  return {
    branches,
    company,
    isParent,
    selectedBranch,
    selectionError,
    companyError,
    ready,
    selectBranch,
  }
}
