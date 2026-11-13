import { z } from 'zod'
import { request } from '@/lib/api'
import { branchSchema, companySchema, type CompanyUpdate } from '@/types/organization'

export async function fetchBranches(token: string, signal: AbortSignal) {
  return z.object({ data: z.array(branchSchema) }).parse(
    await request('ecommerce/company/branches', {
      token,
      signal: AbortSignal.any([signal, AbortSignal.timeout(15_000)]),
    }),
  ).data
}
export async function fetchCompany(token: string, branchId: number | null, signal: AbortSignal) {
  const path =
    branchId === null ? 'ecommerce/company' : `ecommerce/company?branch_company_id=${branchId}`
  return companySchema.parse(
    await request(path, {
      token,
      signal: AbortSignal.any([signal, AbortSignal.timeout(15_000)]),
    }),
  )
}

export async function updateCompany(token: string, branchId: number | null, input: CompanyUpdate) {
  return z.object({ data: companySchema }).parse(
    await request('ecommerce/company', {
      method: 'PUT',
      token,
      body: { ...input, ...(branchId === null ? {} : { branch_company_id: branchId }) },
      signal: AbortSignal.timeout(15_000),
    }),
  ).data
}
