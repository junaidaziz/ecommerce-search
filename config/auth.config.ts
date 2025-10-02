/**
 * Centralized authentication configuration
 * Contains all auth-related messages, placeholders, labels, and validation rules
 */

// Regular expressions for validation
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

// Field placeholders
export const AUTH_PLACEHOLDERS = {
  email: 'Email',
  password: 'Password',
  confirmPassword: 'Confirm Password',
  firstName: 'First Name',
  brandName: 'Brand Name',
} as const;

// Error messages
export const AUTH_ERRORS = {
  emailRequired: 'Email is required',
  emailInvalid: 'Invalid email format',
  passwordRequired: 'Password is required',
  passwordInvalid: 'Password must be at least 8 characters and include uppercase, lowercase, number and special character',
  passwordsNoMatch: 'Passwords do not match',
  firstNameRequired: 'First name is required',
  brandNameRequired: 'Brand name is required',
  brandNameTaken: 'Brand name already taken',
  invalidCredentials: 'Invalid credentials',
  signupFailed: 'Signup failed',
  loginFailed: 'Login failed',
} as const;

// Success messages
export const AUTH_SUCCESS = {
  loginSuccess: 'Login successful',
  signupSuccess: 'Signup successful',
  emailVerified: 'Email verified successfully',
} as const;

// Info messages
export const AUTH_INFO = {
  passwordHint: 'Password must be at least 8 characters and include uppercase, lowercase, number and special character',
  checkEmail: 'Please check your email to verify your account',
} as const;

// Page titles and subtitles
export const AUTH_TITLES = {
  login: {
    title: 'Welcome Back',
    subtitle: 'Sign in to your account to continue.',
  },
  userSignup: {
    title: 'Create Your Account',
    subtitle: 'Sign up to shop, track orders, and enjoy exclusive benefits.',
  },
  brandSignup: {
    title: 'Create Your Brand Account',
    subtitle: 'Sign up to start selling, manage your store, and grow your business.',
  },
} as const;

// Button labels
export const AUTH_BUTTONS = {
  login: 'Login',
  signup: 'Sign Up',
  forgotPassword: 'Forgot Password?',
} as const;

// Link texts
export const AUTH_LINKS = {
  noAccount: "Don't have an account?",
  haveAccount: 'Already have an account?',
  signupLink: 'Sign up',
  loginLink: 'Login',
  brandSignupPrompt: 'Want to sign up as a brand?',
  userSignupPrompt: 'Want to sign up as a brand instead?',
  brandSignupLink: 'Sign up as a brand',
  userSignupLink: 'Sign up as a user',
  notBrand: 'Not a brand?',
} as const;

// Validation rules for react-hook-form
export const getEmailValidation = () => ({
  required: AUTH_ERRORS.emailRequired,
  pattern: { value: EMAIL_REGEX, message: AUTH_ERRORS.emailInvalid },
});

export const getPasswordValidation = () => ({
  required: AUTH_ERRORS.passwordRequired,
  pattern: { value: PASSWORD_REGEX, message: AUTH_ERRORS.passwordInvalid },
});

export const getFirstNameValidation = () => ({
  required: AUTH_ERRORS.firstNameRequired,
});

export const getBrandNameValidation = () => ({
  required: AUTH_ERRORS.brandNameRequired,
});
