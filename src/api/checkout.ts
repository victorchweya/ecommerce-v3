import { z } from 'zod'
import { request } from '@/lib/api'
import { collectionSchema, voucherSchema } from '@/types/checkout'
export async function fetchVoucher(
  token: string,
  branchId: number | null,
  signal: AbortSignal,
  code?: string,
) {
  const params = new URLSearchParams(
    branchId === null ? {} : { branch_company_id: String(branchId) },
  )
  const suffix = code ? `/${encodeURIComponent(code)}` : ''
  const result = await request(`ecommerce/vouchers${suffix}${params.size ? `?${params}` : ''}`, {
    token,
    signal: AbortSignal.any([signal, AbortSignal.timeout(15_000)]),
  })
  if (
    !code &&
    z.object({ message: z.literal('No valid voucher found.') }).safeParse(result).success
  )
    return null
  const voucher = voucherSchema.parse(result)
  if (code && voucher.code.toLowerCase() !== code.toLowerCase())
    throw new Error('Unexpected voucher in response.')
  return voucher
}

import { scopedBody, scopedPath, type CommerceTarget } from '@/queries/context'
export async function initiatePayment(
  target: CommerceTarget,
  amount: number,
  mpesa_number: string,
) {
  const collection = z.object({ data: collectionSchema }).parse(
    await request('ecommerce/checkout/init-mpesa-checkout', {
      method: 'POST',
      token: target.token,
      body: scopedBody({ amount, mpesa_number }, target),
      signal: AbortSignal.timeout(30_000),
    }),
  ).data
  if (collection.company_id !== target.companyId || collection.amount !== amount)
    throw new Error('Unexpected payment collection in response.')
  return collection
}
export async function fetchPayment(target: CommerceTarget, id: number) {
  const collection = collectionSchema.parse(
    await request(scopedPath(`ecommerce/checkout/collections/${id}`, target), {
      token: target.token,
      signal: AbortSignal.timeout(15_000),
    }),
  )
  if (collection.id !== id || collection.company_id !== target.companyId)
    throw new Error('Unexpected payment collection in response.')
  return collection
}
