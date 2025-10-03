/**
 * Tests for Zod validation schemas
 */

import {
  loginSchema,
  userSignupSchema,
  brandSignupSchema,
  brandSettingsSchema,
  userProfileSchema,
  changePasswordSchema,
  newsletterSchema,
} from '@lib/validation';

describe('Validation Schemas', () => {
  describe('loginSchema', () => {
    it('should validate valid login data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'Password123!',
      };
      expect(() => loginSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'Password123!',
      };
      expect(() => loginSchema.parse(invalidData)).toThrow();
    });

    it('should reject weak password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'weak',
      };
      expect(() => loginSchema.parse(invalidData)).toThrow();
    });

    it('should reject empty email', () => {
      const invalidData = {
        email: '',
        password: 'Password123!',
      };
      expect(() => loginSchema.parse(invalidData)).toThrow();
    });
  });

  describe('userSignupSchema', () => {
    it('should validate valid signup data', () => {
      const validData = {
        firstName: 'John',
        email: 'john@example.com',
        password: 'Password123!',
        confirm: 'Password123!',
      };
      expect(() => userSignupSchema.parse(validData)).not.toThrow();
    });

    it('should reject mismatched passwords', () => {
      const invalidData = {
        firstName: 'John',
        email: 'john@example.com',
        password: 'Password123!',
        confirm: 'DifferentPassword123!',
      };
      expect(() => userSignupSchema.parse(invalidData)).toThrow();
    });

    it('should reject empty first name', () => {
      const invalidData = {
        firstName: '',
        email: 'john@example.com',
        password: 'Password123!',
        confirm: 'Password123!',
      };
      expect(() => userSignupSchema.parse(invalidData)).toThrow();
    });
  });

  describe('brandSignupSchema', () => {
    it('should validate valid brand signup data', () => {
      const validData = {
        brandName: 'My Brand',
        email: 'brand@example.com',
        password: 'Password123!',
        confirm: 'Password123!',
      };
      expect(() => brandSignupSchema.parse(validData)).not.toThrow();
    });

    it('should reject empty brand name', () => {
      const invalidData = {
        brandName: '',
        email: 'brand@example.com',
        password: 'Password123!',
        confirm: 'Password123!',
      };
      expect(() => brandSignupSchema.parse(invalidData)).toThrow();
    });
  });

  describe('changePasswordSchema', () => {
    it('should validate valid password change data', () => {
      const validData = {
        current: 'OldPassword123!',
        password: 'NewPassword123!',
        confirm: 'NewPassword123!',
      };
      expect(() => changePasswordSchema.parse(validData)).not.toThrow();
    });

    it('should reject mismatched new passwords', () => {
      const invalidData = {
        current: 'OldPassword123!',
        password: 'NewPassword123!',
        confirm: 'DifferentPassword123!',
      };
      expect(() => changePasswordSchema.parse(invalidData)).toThrow();
    });
  });

  describe('newsletterSchema', () => {
    it('should validate valid email', () => {
      const validData = {
        email: 'newsletter@example.com',
      };
      expect(() => newsletterSchema.parse(validData)).not.toThrow();
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
      };
      expect(() => newsletterSchema.parse(invalidData)).toThrow();
    });
  });

  describe('userProfileSchema', () => {
    it('should validate valid profile data', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phoneNumber: '+1234567890',
      };
      expect(() => userProfileSchema.parse(validData)).not.toThrow();
    });

    it('should allow optional phone number', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      };
      expect(() => userProfileSchema.parse(validData)).not.toThrow();
    });
  });

  describe('brandSettingsSchema', () => {
    it('should validate valid brand settings', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'brand@example.com',
        brandName: 'My Brand',
        phoneNumber: '+1234567890',
        businessAddress: '123 Main St',
        city: 'New York',
        country: 'US',
        website: 'https://mybrand.com',
        businessDescription: 'We sell awesome products',
        taxId: '12-3456789',
      };
      expect(() => brandSettingsSchema.parse(validData)).not.toThrow();
    });

    it('should allow optional fields', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'brand@example.com',
        brandName: 'My Brand',
      };
      expect(() => brandSettingsSchema.parse(validData)).not.toThrow();
    });
  });
});
