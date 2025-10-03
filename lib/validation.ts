/**
 * Centralized Zod validation schemas
 * Single source of truth for all form validations
 */

import { z } from 'zod';

// Email validation regex - same as auth.config.ts
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation regex - same as auth.config.ts
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

// Reusable field validators
export const emailValidator = z
  .string()
  .min(1, 'Email is required')
  .regex(EMAIL_REGEX, 'Invalid email format');

export const passwordValidator = z
  .string()
  .min(1, 'Password is required')
  .regex(
    PASSWORD_REGEX,
    'Password must be at least 8 characters and include uppercase, lowercase, number and special character'
  );

// Login schema
export const loginSchema = z.object({
  email: emailValidator,
  password: passwordValidator,
});

export type LoginFormData = z.infer<typeof loginSchema>;

// User signup schema
export const userSignupSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    email: emailValidator,
    password: passwordValidator,
    confirm: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });

export type UserSignupFormData = z.infer<typeof userSignupSchema>;

// Brand signup schema
export const brandSignupSchema = z
  .object({
    brandName: z.string().min(1, 'Brand name is required'),
    email: emailValidator,
    password: passwordValidator,
    confirm: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });

export type BrandSignupFormData = z.infer<typeof brandSignupSchema>;

// Brand settings schema
export const brandSettingsSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: emailValidator,
  brandName: z.string().min(1, 'Brand name is required'),
  phoneNumber: z.string().optional(),
  businessAddress: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  website: z.string().optional(),
  businessDescription: z.string().optional(),
  taxId: z.string().optional(),
});

export type BrandSettingsFormData = z.infer<typeof brandSettingsSchema>;

// Checkout schema
export const checkoutSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: emailValidator,
  address: z.string().min(1, 'Address is required'),
  country: z.string().min(1, 'Country is required'),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

// Newsletter schema
export const newsletterSchema = z.object({
  email: emailValidator,
});

export type NewsletterFormData = z.infer<typeof newsletterSchema>;

// Product form schema (for brand side)
export const productFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  price: z.number().min(0, 'Price must be positive'),
  stock: z.number().int().min(0, 'Stock must be a positive number'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().optional(),
  sku: z.string().optional(),
  images: z.array(z.string()).optional(),
});

export type ProductFormData = z.infer<typeof productFormSchema>;
