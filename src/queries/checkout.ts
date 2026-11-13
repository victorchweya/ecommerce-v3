import { queryOptions } from '@tanstack/vue-query'
import { fetchVoucher } from '@/api/checkout'
export const voucherQuery = (
  token: string,
  revision: number,
  branchId: number | null,
  code?: string,
) =>
  queryOptions({
    queryKey: ['branch', revision, branchId, 'voucher', code ?? null],
    queryFn: ({ signal }) => fetchVoucher(token, branchId, signal, code),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    meta: { sessionRevision: revision },
  })
