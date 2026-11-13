import { z } from 'zod'
export const profileDetailsSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name.').max(255),
  phone: z.string().trim().min(1, 'Enter your phone number.').max(255),
  designation: z.string().trim().max(255),
})
export const passwordChangeSchema = z
  .object({
    current_password: z.string().min(8, 'Enter your current password.'),
    password: z.string().min(8, 'Use at least eight characters.'),
    password_confirmation: z.string(),
  })
  .refine((value) => value.password === value.password_confirmation, {
    path: ['password_confirmation'],
    message: 'The passwords do not match.',
  })
export const invitationEmailSchema = z.email().max(255)
