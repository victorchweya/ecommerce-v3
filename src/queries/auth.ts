import { queryOptions } from '@tanstack/vue-query'
import { fetchProfile } from '@/api/auth'

export const profileQuery = (token: string, revision: number) =>
  queryOptions({
    queryKey: ['session', revision, 'profile'],
    queryFn: ({ signal }) => fetchProfile(token, signal),
    enabled: Boolean(token),
    staleTime: 60_000,
    meta: { sessionRevision: revision },
  })
