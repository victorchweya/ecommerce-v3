import { beforeEach, expect, it, vi } from 'vitest'
import { register, acceptInvitation } from '../auth'
import { updateCompany } from '../organization'
import { createAddress } from '../addresses'
const fetchMock = vi.fn()
const registration = {
  name: 'Customer',
  email: 'customer@example.test',
  phone: '0712345678',
  business_name: 'Business',
  category: 'Retail',
}
beforeEach(() => {
  vi.stubEnv('VITE_API_URL', 'https://api.example.test/api')
  vi.stubGlobal('fetch', fetchMock)
  fetchMock.mockReset()
})
it('accepts a tokenless lead response and sends only the supported registration fields', async () => {
  fetchMock.mockResolvedValueOnce(
    new Response(
      JSON.stringify({ data: { company: { id: 10, name: 'Business', is_lead: true } } }),
      { status: 201 },
    ),
  )
  expect((await register(registration)).id).toBe(10)
  const [url, init] = fetchMock.mock.calls[0]!
  expect(String(url)).toBe('https://api.example.test/api/auth/register')
  expect(new Headers(init.headers).has('Authorization')).toBe(false)
  expect(JSON.parse(init.body)).toEqual(registration)
})
it('rejects the existing HTTP-200 error envelope instead of claiming registration succeeded', async () => {
  fetchMock.mockResolvedValueOnce(
    new Response(JSON.stringify({ message: 'Something went wrong', error: 'Database error' })),
  )
  await expect(register(registration)).rejects.toThrow()
  expect(fetchMock).toHaveBeenCalledTimes(1)
})
it('accepts an invitation without creating a frontend session', async () => {
  fetchMock.mockResolvedValueOnce(
    new Response(JSON.stringify({ message: 'Invitation accepted successfully' })),
  )
  const input = {
    token: 'invitation-test',
    email: registration.email,
    name: registration.name,
    phone: registration.phone,
    password: 'secret-test',
    password_confirmation: 'secret-test',
  }
  await acceptInvitation(input)
  expect(JSON.parse(fetchMock.mock.calls[0]![1].body)).toEqual(input)
  expect(new Headers(fetchMock.mock.calls[0]![1].headers).has('Authorization')).toBe(false)
})
it('puts parent branch context in company writes, retaining a real postal code', async () => {
  fetchMock.mockResolvedValueOnce(
    new Response(JSON.stringify({ data: { id: 22, name: 'Branch' } })),
  )
  const input = {
    billing_details: {
      business_name: 'Branch',
      address: 'Road',
      postal_code: '00100',
      city: 'Nairobi',
    },
    kra_pin: null,
  }
  await updateCompany('test-token', 22, input)
  expect(JSON.parse(fetchMock.mock.calls[0]![1].body)).toEqual({ ...input, branch_company_id: 22 })
})
it('does not branch-scope an independent address write or invent coordinates', async () => {
  fetchMock.mockResolvedValueOnce(
    new Response(JSON.stringify({ data: { id: 1, company_id: 10, name: 'Office' } })),
  )
  const input = {
    address_type: 'office' as const,
    name: 'Office',
    address: 'Road',
    city: 'Nairobi',
    contact_person_name: 'Customer',
    contact_person_phone: registration.phone,
    latitude: -1.28,
    longitude: 36.82,
    is_default: true,
  }
  await createAddress('test-token', null, input)
  expect(JSON.parse(fetchMock.mock.calls[0]![1].body)).toEqual(input)
})
