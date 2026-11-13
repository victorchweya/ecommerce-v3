import { queryClient } from '@/lib/query-client'
import { useAuthStore } from '@/stores/auth'
import { useOrganizationStore } from '@/stores/organization'

export function replaceSession(token: string) {
  queryClient.clear()
  useOrganizationStore().selectBranch(null)
  useAuthStore().setToken(token)
}
