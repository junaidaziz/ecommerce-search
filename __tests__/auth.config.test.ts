import {
  EMAIL_REGEX,
  PASSWORD_REGEX,
  AUTH_PLACEHOLDERS,
  AUTH_ERRORS,
  AUTH_SUCCESS,
  AUTH_INFO,
  AUTH_TITLES,
  AUTH_BUTTONS,
  AUTH_LINKS,
  getEmailValidation,
  getPasswordValidation,
  getFirstNameValidation,
  getBrandNameValidation,
} from '@/config/auth.config';

describe('Auth Config', () => {
  describe('Regular Expressions', () => {
    it('EMAIL_REGEX should validate correct email formats', () => {
      expect(EMAIL_REGEX.test('test@example.com')).toBe(true);
      expect(EMAIL_REGEX.test('user.name@domain.co.uk')).toBe(true);
      expect(EMAIL_REGEX.test('invalid-email')).toBe(false);
      expect(EMAIL_REGEX.test('@example.com')).toBe(false);
      expect(EMAIL_REGEX.test('test@')).toBe(false);
    });

    it('PASSWORD_REGEX should validate password requirements', () => {
      // Valid passwords
      expect(PASSWORD_REGEX.test('Password1!')).toBe(true);
      expect(PASSWORD_REGEX.test('MyP@ssw0rd')).toBe(true);
      
      // Invalid passwords
      expect(PASSWORD_REGEX.test('password')).toBe(false); // No uppercase or number
      expect(PASSWORD_REGEX.test('PASSWORD')).toBe(false); // No lowercase or number
      expect(PASSWORD_REGEX.test('Password1')).toBe(false); // No special char
      expect(PASSWORD_REGEX.test('Pass1!')).toBe(false); // Too short
    });
  });

  describe('Constants', () => {
    it('should have correct placeholder values', () => {
      expect(AUTH_PLACEHOLDERS.email).toBe('Email');
      expect(AUTH_PLACEHOLDERS.password).toBe('Password');
      expect(AUTH_PLACEHOLDERS.confirmPassword).toBe('Confirm Password');
      expect(AUTH_PLACEHOLDERS.firstName).toBe('First Name');
      expect(AUTH_PLACEHOLDERS.brandName).toBe('Brand Name');
    });

    it('should have error messages', () => {
      expect(AUTH_ERRORS.emailRequired).toBe('Email is required');
      expect(AUTH_ERRORS.passwordRequired).toBe('Password is required');
      expect(AUTH_ERRORS.invalidCredentials).toBe('Invalid credentials');
    });

    it('should have success messages', () => {
      expect(AUTH_SUCCESS.loginSuccess).toBe('Login successful');
      expect(AUTH_SUCCESS.signupSuccess).toBe('Signup successful');
    });

    it('should have info messages', () => {
      expect(AUTH_INFO.passwordHint).toBeDefined();
      expect(AUTH_INFO.checkEmail).toBeDefined();
    });

    it('should have titles for different auth pages', () => {
      expect(AUTH_TITLES.login.title).toBe('Welcome Back');
      expect(AUTH_TITLES.userSignup.title).toBe('Create Your Account');
      expect(AUTH_TITLES.brandSignup.title).toBe('Create Your Brand Account');
    });

    it('should have button labels', () => {
      expect(AUTH_BUTTONS.login).toBe('Login');
      expect(AUTH_BUTTONS.signup).toBe('Sign Up');
      expect(AUTH_BUTTONS.forgotPassword).toBe('Forgot Password?');
    });

    it('should have link texts', () => {
      expect(AUTH_LINKS.noAccount).toBeDefined();
      expect(AUTH_LINKS.haveAccount).toBeDefined();
      expect(AUTH_LINKS.signupLink).toBe('Sign up');
      expect(AUTH_LINKS.loginLink).toBe('Login');
    });
  });

  describe('Validation Functions', () => {
    it('getEmailValidation should return correct validation rules', () => {
      const validation = getEmailValidation();
      expect(validation.required).toBe(AUTH_ERRORS.emailRequired);
      expect(validation.pattern.value).toBe(EMAIL_REGEX);
      expect(validation.pattern.message).toBe(AUTH_ERRORS.emailInvalid);
    });

    it('getPasswordValidation should return correct validation rules', () => {
      const validation = getPasswordValidation();
      expect(validation.required).toBe(AUTH_ERRORS.passwordRequired);
      expect(validation.pattern.value).toBe(PASSWORD_REGEX);
      expect(validation.pattern.message).toBe(AUTH_ERRORS.passwordInvalid);
    });

    it('getFirstNameValidation should return correct validation rules', () => {
      const validation = getFirstNameValidation();
      expect(validation.required).toBe(AUTH_ERRORS.firstNameRequired);
    });

    it('getBrandNameValidation should return correct validation rules', () => {
      const validation = getBrandNameValidation();
      expect(validation.required).toBe(AUTH_ERRORS.brandNameRequired);
    });
  });
});
