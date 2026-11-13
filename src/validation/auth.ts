import { z } from 'zod'

export const emailSchema = z.string().trim().email('Enter a valid email address.')
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password.'),
})
export const forgotPasswordSchema = z.object({ email: emailSchema })
export const resetPasswordSchema = z
  .object({
    email: emailSchema,
    token: z.string().min(1, 'Open the link from your password reset email.'),
    password: z.string().min(8, 'Use at least 8 characters.'),
    password_confirmation: z.string().min(1, 'Confirm your password.'),
  })
  .refine((values) => values.password === values.password_confirmation, {
    path: ['password_confirmation'],
    message: 'Passwords must match.',
  })
export const otpContactSchema = z.object({
  contact: z
    .string()
    .trim()
    .min(1, 'Enter your email or phone number.')
    .refine(
      (value) => emailSchema.safeParse(value).success || /^\+?[\d\s()-]{9,20}$/.test(value),
      'Enter a valid email or phone number.',
    ),
})
export const otpCodeSchema = z.object({
  otp_code: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code.'),
})

export const registrationSchema = z.object({
  business_name: z.string().trim().min(1, 'Enter your business name.'),
  category: z.string().min(1, 'Choose a business category.'),
  name: z.string().trim().min(1, 'Enter your name.').max(100, 'Use at most 100 characters.'),
  email: emailSchema,
  phone: z.string().regex(/^\d{10}$/, 'Enter a 10-digit phone number, for example 0712345678.'),
})
export const invitationSchema = z
  .object({
    token: z.string().min(1),
    email: emailSchema,
    name: z.string().trim().min(1, 'Enter your name.'),
    phone: z.string().regex(/^\d+$/, 'Enter a phone number using digits only.'),
    password: z.string().min(6, 'Use at least 6 characters.'),
    password_confirmation: z.string().min(1, 'Confirm your password.'),
  })
  .refine((input) => input.password === input.password_confirmation, {
    path: ['password_confirmation'],
    message: 'Passwords must match.',
  })
