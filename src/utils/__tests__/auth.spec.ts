import { describe, expect, it } from 'vitest'
import { accountAccess, safeReturnTo } from '../auth'
import { profileSchema, sessionSchema } from '@/types/auth'
import { loginSchema, resetPasswordSchema } from '@/validation/auth'

const profile = profileSchema.parse({
  id: 1,
  name: 'Customer',
  email: 'customer@example.test',
  user_type: 'customer',
  customer: { company: { id: 10, name: 'Company', status: 'active' } },
})
describe('account access', () => {
  it.each([
    ['active', 'active'],
    ['pending', 'pending'],
    ['inactive', 'denied'],
    ['dormant', 'denied'],
    ['unknown', 'denied'],
  ] as const)('handles company %s as %s', (status, expected) => {
    expect(
      accountAccess({
        ...profile,
        customer: { company: { ...profile.customer!.company!, status } },
      }),
    ).toBe(expected)
  })
  it('does not treat a missing company or suspended user as pending', () => {
    expect(accountAccess({ ...profile, customer: null })).toBe('denied')
    expect(accountAccess({ ...profile, status: 'suspended' })).toBe('denied')
  })
  it('retains the existing parent-organisation access rule', () => {
    expect(
      accountAccess({
        ...profile,
        customer: {
          company: {
            id: 20,
            name: 'Parent',
            status: 'pending',
            organisation_structure: 'parent_organisation',
          },
        },
      }),
    ).toBe('active')
  })
})
describe('safe return navigation', () => {
  it.each([
    'https://example.test',
    '//example.test',
    '/\\example.test',
    '/auth/login?returnTo=/',
    '/access-denied',
    '/error',
    undefined,
    ['/', '//example.test'],
    '/path\n',
  ])('rejects unsafe or looping return location %j', (value) => {
    expect(safeReturnTo(value)).toBe('/')
  })
  it('keeps an internal path and its filters', () => {
    expect(safeReturnTo('/parent-account?tab=branches#selected')).toBe(
      '/parent-account?tab=branches#selected',
    )
  })
})
it('validates customer-only sessions and required context at the API boundary', () => {
  expect(
    sessionSchema.safeParse({ data: { token: 'test', user: { id: 1, user_type: 'staff' } } })
      .success,
  ).toBe(false)
  expect(
    sessionSchema.safeParse({ data: { token: '', user: { id: 1, user_type: 'customer' } } })
      .success,
  ).toBe(false)
  expect(
    profileSchema.safeParse({ ...profile, customer: { company: { name: 'Missing ID' } } }).success,
  ).toBe(false)
})
it('trims emails without altering passwords and checks reset confirmation', () => {
  expect(
    loginSchema.parse({ email: ' customer@example.test ', password: ' keep spaces ' }).password,
  ).toBe(' keep spaces ')
  expect(
    resetPasswordSchema.safeParse({
      email: profile.email,
      token: 'reset-test',
      password: 'password1',
      password_confirmation: 'password2',
    }).success,
  ).toBe(false)
})

describe('public document/session boundary', () => {
  it('treats signed documents as public only when the URL includes a signature', async () => {
    const { isPublicRoute } = await import('../auth')
    expect(
      isPublicRoute({ meta: { signedDocument: true }, query: { signature: 'test-signature' } }),
    ).toBe(true)
    expect(isPublicRoute({ meta: { signedDocument: true }, query: {} })).toBe(false)
    expect(isPublicRoute({ meta: { publicPage: true }, query: {} })).toBe(true)
    expect(isPublicRoute({ meta: { requiresAuth: true }, query: { signature: 'test' } })).toBe(
      false,
    )
  })
})
