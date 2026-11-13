import { z } from 'zod'
import { request } from '@/lib/api'
import { scopedPath, type CommerceTarget } from '@/queries/context'
import { profileSchema } from '@/types/auth'
import {
  creditNoteSchema,
  creditNotesPageSchema,
  staffSchema,
  invitationSchema,
  orderInsightsSchema,
  priceTrendsSchema,
} from '@/types/account'
export async function updateProfile(target: CommerceTarget, input: object) {
  return z.object({ data: profileSchema }).parse(
    await request('ecommerce/profile', {
      token: target.token,
      method: 'PUT',
      body: input,
      signal: AbortSignal.timeout(20_000),
    }),
  ).data
}
export async function fetchStaff(target: CommerceTarget, signal: AbortSignal) {
  return z
    .array(staffSchema)
    .parse(await request('ecommerce/staff', { token: target.token, signal }))
}
export async function fetchInvitations(target: CommerceTarget, signal: AbortSignal) {
  return z
    .array(invitationSchema)
    .parse(await request('ecommerce/staff/invitations', { token: target.token, signal }))
}
export async function inviteStaff(target: CommerceTarget, email: string) {
  return request('ecommerce/staff/invite', {
    token: target.token,
    method: 'POST',
    body: { email },
    signal: AbortSignal.timeout(20_000),
  })
}
export async function cancelInvitation(target: CommerceTarget, id: number) {
  return request(`ecommerce/staff/invitations/${id}/cancel`, {
    token: target.token,
    signal: AbortSignal.timeout(20_000),
  })
}
export async function fetchCreditNotes(
  target: CommerceTarget,
  page: number,
  search: string,
  signal: AbortSignal,
) {
  const result = creditNotesPageSchema.parse(
    await request(scopedPath('ecommerce/credit-notes', target, { page, search }), {
      token: target.token,
      signal,
    }),
  )
  if (result.data.some((note) => note.company_id !== target.companyId))
    throw new Error('Unexpected company in credit note results.')
  return result
}
export async function fetchCreditNote(target: CommerceTarget, id: number, signal: AbortSignal) {
  const note = creditNoteSchema.parse(
    await request(scopedPath(`ecommerce/credit-notes/single/${id}`, target), {
      token: target.token,
      signal,
    }),
  )
  if (note.id !== id || note.company_id !== target.companyId)
    throw new Error('Unexpected credit note in response.')
  return note
}
export async function fetchInsights(
  target: CommerceTarget,
  month: number,
  year: number,
  signal: AbortSignal,
) {
  return orderInsightsSchema.parse(
    await request(scopedPath('ecommerce/insights/top-ordered-products', target, { month, year }), {
      token: target.token,
      signal,
    }),
  )
}
export async function fetchPriceTrends(
  target: CommerceTarget,
  month: number,
  year: number,
  signal: AbortSignal,
) {
  return priceTrendsSchema.parse(
    await request(scopedPath('ecommerce/insights/price-trend', target, { month, year }), {
      token: target.token,
      signal,
    }),
  )
}
