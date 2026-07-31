import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email("Valid email required"),
  fullName: z.string().min(2).max(100),
  password: z.string()
    .min(8, "Min 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[0-9]/, "Must contain number"),
  role: z.enum(['ADMIN', 'VIEWER', 'HELPER']).optional().default('ADMIN'),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string()
    .min(8, "Min 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[0-9]/, "Must contain number"),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
});

export type RegisterDTO = z.infer<typeof registerSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>;
export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>;
