import { expect, it } from 'vitest'
import { registrationSchema, invitationSchema } from '../auth'
import { billingDetailsSchema, coordinatesSchema, companyCategories } from '../organization'
import { safeReturnTo } from '@/utils/auth'
it('requires a ten-digit registration phone without asking for a password', () => {
  const input = {
    name: 'Customer',
    email: 'customer@example.test',
    phone: '0712345678',
    business_name: 'Business',
    category: 'Charity',
  }
  expect(registrationSchema.safeParse(input).success).toBe(true)
  expect(registrationSchema.safeParse({ ...input, phone: '+254712345678' }).success).toBe(false)
  expect(companyCategories).toContain('Charity')
})
it('requires a real postal code and finite coordinates within latitude/longitude ranges', () => {
  expect(
    billingDetailsSchema.safeParse({
      business_name: 'Business',
      address: 'Road',
      city: 'Nairobi',
      postal_code: '',
      kra_pin: '',
    }).success,
  ).toBe(false)
  expect(coordinatesSchema.safeParse({ latitude: 0, longitude: 0 }).success).toBe(true)
  expect(coordinatesSchema.safeParse({ latitude: 91, longitude: 36 }).success).toBe(false)
  expect(coordinatesSchema.safeParse({ latitude: NaN, longitude: 36 }).success).toBe(false)
})
it('requires invitation confirmation and permits only known setup return routes', () => {
  expect(
    invitationSchema.safeParse({
      token: 'test',
      email: 'customer@example.test',
      name: 'Customer',
      phone: '0712345678',
      password: 'secret',
      password_confirmation: 'mismatch',
    }).success,
  ).toBe(false)
  expect(safeReturnTo('/auth/billing-details')).toBe('/auth/billing-details')
  expect(safeReturnTo('/auth/accept-invitation?token=private')).toBe('/')
  expect(safeReturnTo('//example.test/auth/contact-person')).toBe('/')
})
