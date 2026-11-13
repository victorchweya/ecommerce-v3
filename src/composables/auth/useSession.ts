import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { profileQuery } from '@/queries/auth'
import { useAuthStore } from '@/stores/auth'
import { accountAccess } from '@/utils/auth'

export function useSession() {
  const auth = useAuthStore()
  const profile = useQuery(computed(() => profileQuery(auth.token, auth.revision)))
  const homeCompany = computed(() => profile.data.value?.customer?.company ?? null)
  const access = computed(() =>
    profile.data.value && !profile.isError.value ? accountAccess(profile.data.value) : null,
  )
  const isParent = computed(
    () => homeCompany.value?.organisation_structure === 'parent_organisation',
  )
  return { profile, homeCompany, access, isParent }
}
