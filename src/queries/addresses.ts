import { queryOptions } from '@tanstack/vue-query'
import { fetchAddresses } from '@/api/addresses'
export const addressesQuery = (token: string, revision: number, branchId: number | null) =>
  queryOptions({
    queryKey: ['branch', revision, branchId, 'addresses'],
    queryFn: ({ signal }) => fetchAddresses(token, branchId, signal),
    enabled: Boolean(token),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    meta: { sessionRevision: revision },
  })
