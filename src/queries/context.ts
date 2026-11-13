export interface CommerceTarget {
  token: string
  revision: number
  branchId: number | null
  companyId: number
  generation: number
}
export function scopedPath(
  path: string,
  target: Pick<CommerceTarget, 'branchId'>,
  values: object = {},
) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(values))
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value))
  if (target.branchId !== null) params.set('branch_company_id', String(target.branchId))
  return `${path}${params.size ? `?${params}` : ''}`
}
export function scopedBody(input: object, target: Pick<CommerceTarget, 'branchId'>) {
  return { ...input, ...(target.branchId === null ? {} : { branch_company_id: target.branchId }) }
}
export function commerceQuery<T>(
  target: CommerceTarget,
  key: readonly unknown[],
  fetcher: (target: CommerceTarget, signal: AbortSignal) => Promise<T>,
  home = false,
) {
  return {
    queryKey: home
      ? ['session', target.revision, ...key]
      : ['branch', target.revision, target.branchId, ...key],
    queryFn: ({ signal }: { signal: AbortSignal }) =>
      fetcher(target, AbortSignal.any([signal, AbortSignal.timeout(20_000)])),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    meta: { sessionRevision: target.revision },
  }
}
