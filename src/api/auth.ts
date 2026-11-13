import { z } from 'zod'
import { request } from '@/lib/api'
import { registrationResponseSchema, profileSchema, sessionSchema } from '@/types/auth'
import type {
  LoginInput,
  OtpContact,
  OtpLoginInput,
  ResetPasswordInput,
  RegistrationInput,
  InvitationInput,
} from '@/types/auth'

export async function login(input: LoginInput) {
  return sessionSchema.parse(
    await request('auth/login', {
      method: 'POST',
      body: input,
      signal: AbortSignal.timeout(15_000),
    }),
  ).data
}
export async function requestOtp(contact: OtpContact) {
  return z.object({ otp_token: z.string().min(1), channel: z.enum(['sms', 'email']) }).parse(
    await request('auth/customer/request-otp', {
      method: 'POST',
      body: { ...contact, intent: 'login', channel: 'auto' },
      signal: AbortSignal.timeout(15_000),
    }),
  )
}
export async function loginWithOtp(input: OtpLoginInput) {
  return sessionSchema.parse(
    await request('auth/customer/login-otp', {
      method: 'POST',
      body: input,
      signal: AbortSignal.timeout(15_000),
    }),
  ).data
}
export function logout(token: string) {
  return request('auth/logout', { token, signal: AbortSignal.timeout(15_000) })
}
export async function fetchProfile(token: string, signal: AbortSignal) {
  return profileSchema.parse(
    await request('ecommerce/profile', {
      token,
      signal: AbortSignal.any([signal, AbortSignal.timeout(15_000)]),
    }),
  )
}
export function forgotPassword(email: string) {
  return request('auth/forgot-password', {
    method: 'POST',
    body: { email },
    signal: AbortSignal.timeout(15_000),
  })
}
export function resetPassword(input: ResetPasswordInput) {
  return request('auth/reset-password', {
    method: 'POST',
    body: input,
    signal: AbortSignal.timeout(15_000),
  })
}

export async function register(input: RegistrationInput) {
  return registrationResponseSchema.parse(
    await request('auth/register', {
      method: 'POST',
      body: input,
      signal: AbortSignal.timeout(15_000),
    }),
  ).data.company
}
export async function acceptInvitation(input: InvitationInput) {
  return z.object({ message: z.string().min(1) }).parse(
    await request('auth/accept-invitation', {
      method: 'POST',
      body: input,
      signal: AbortSignal.timeout(15_000),
    }),
  )
}
