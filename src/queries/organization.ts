import { queryOptions } from '@tanstack/vue-query'
import { fetchBranches, fetchCompany } from '@/api/organization'

export const branchesQuery = (token: string, revision: number) =>
  queryOptions({
    queryKey: ['session', revision, 'branches'],
    queryFn: ({ signal }) => fetchBranches(token, signal),
    enabled: Boolean(token),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    meta: { sessionRevision: revision },
  })
export const companyQuery = (token: string, revision: number, branchId: number | null) =>
  queryOptions({
    queryKey: ['branch', revision, branchId, 'company'],
    queryFn: ({ signal }) => fetchCompany(token, branchId, signal),
    enabled: Boolean(token),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    meta: { sessionRevision: revision },
  })
