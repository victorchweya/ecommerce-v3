import { z } from 'zod'
import { companySchema } from './organization'

export const profileSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  email: z.string(),
  phone: z.string().nullish(),
  user_type: z.literal('customer'),
  status: z.string().nullish(),
  customer: z
    .object({
      company: companySchema.nullable(),
      designation: z.string().nullish(),
      communication_preference: z.string().nullish(),
      notification_preferences: z
        .object({
          billing: z
            .object({ email: z.boolean().optional(), sms: z.boolean().optional() })
            .optional(),
        })
        .nullish(),
    })
    .nullable(),
})
export const sessionSchema = z.object({
  data: z.object({
    token: z.string().min(1),
    user: z.object({ id: z.number().int().positive(), user_type: z.literal('customer') }),
  }),
})
export type Profile = z.infer<typeof profileSchema>
export interface LoginInput {
  email: string
  password: string
}
export interface OtpContact {
  email?: string
  phone?: string
}
export interface OtpLoginInput extends OtpContact {
  otp_token: string
  otp_code: string
}
export interface ResetPasswordInput {
  email: string
  token: string
  password: string
  password_confirmation: string
}

export interface RegistrationInput {
  business_name: string
  category: string
  name: string
  email: string
  phone: string
}
export interface InvitationInput {
  token: string
  name: string
  email: string
  phone: string
  password: string
  password_confirmation: string
}
export const registrationResponseSchema = z.object({
  data: z.object({ company: companySchema.extend({ is_lead: z.literal(true) }) }),
})
