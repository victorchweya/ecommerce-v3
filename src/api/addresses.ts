import { z } from 'zod'
import { request } from '@/lib/api'
import { addressSchema, type DeliveryAddressInput } from '@/types/addresses'
export async function fetchAddresses(token: string, branchId: number | null, signal: AbortSignal) {
  const path =
    branchId === null ? 'ecommerce/addresses' : `ecommerce/addresses?branch_company_id=${branchId}`
  return z.array(addressSchema).parse(
    await request(path, {
      token,
      signal: AbortSignal.any([signal, AbortSignal.timeout(15_000)]),
    }),
  )
}
export async function createAddress(
  token: string,
  branchId: number | null,
  input: DeliveryAddressInput,
) {
  return z.object({ data: addressSchema }).parse(
    await request('ecommerce/addresses', {
      method: 'POST',
      token,
      body: { ...input, ...(branchId === null ? {} : { branch_company_id: branchId }) },
      signal: AbortSignal.timeout(15_000),
    }),
  ).data
}

import { scopedPath, scopedBody, type CommerceTarget } from '@/queries/context'
export async function updateAddress(
  target: CommerceTarget,
  id: number,
  input: Partial<DeliveryAddressInput>,
) {
  const address = z.object({ data: addressSchema }).parse(
    await request(`ecommerce/addresses/${id}`, {
      token: target.token,
      method: 'PUT',
      body: scopedBody(input, target),
      signal: AbortSignal.timeout(20_000),
    }),
  ).data
  if (address.id !== id || address.company_id !== target.companyId)
    throw new Error('Unexpected address in response.')
  return address
}
export async function deleteAddress(target: CommerceTarget, id: number) {
  return request(scopedPath(`ecommerce/addresses/${id}`, target), {
    token: target.token,
    method: 'DELETE',
    signal: AbortSignal.timeout(20_000),
  })
}
