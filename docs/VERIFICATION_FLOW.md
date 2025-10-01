# Backend Verification Flow Implementation

## Overview
This document describes the environment-based verification flow for user and brand signup.

## Environment Behavior

### Production (`NODE_ENV=production`)
1. **Signup**: 
   - Generate verification token
   - Set `verified = false`
   - Return token for email confirmation
   
2. **Email Confirmation**:
   - User clicks link with token
   - Token validated via `/api/verify-email?token=xxx`
   - If valid, set `verified = true`
   
3. **Dashboard Access**:
   - Brands must be verified to access dashboard
   - Unverified brands see verification required message

### Local/Development (`NODE_ENV=development` or not production)
1. **Signup**:
   - Skip token generation (set to `null`)
   - Set `verified = true` (auto-confirm)
   - Return empty token string
   
2. **Email Confirmation**:
   - Not needed - users already verified
   
3. **Dashboard Access**:
   - No verification check - immediate access

## API Endpoints

### POST `/api/signup/brand`
Creates a new brand account.

**Request:**
```json
{
  "email": "brand@example.com",
  "password": "securePassword",
  "firstName": "BrandName"
}
```

**Response (Production):**
```json
{
  "token": "abc123def456..." // 40-char hex token
}
```

**Response (Local/Dev):**
```json
{
  "token": "" // Empty string - no email verification needed
}
```

**Error Responses:**
- `400`: Missing required fields
- `405`: Method not allowed (not POST)
- `409`: User already exists
- `500`: Server error

### POST `/api/signup/user`
Similar to brand signup but with `role: 'USER'`.

### GET `/api/verify-email?token=xxx`
Verifies an email with the provided token.

**Response (Success):**
```json
{
  "message": "Email verified successfully"
}
```

**Error Responses:**
- `400` + `TOKEN_REQUIRED`: Token parameter missing
- `400` + `INVALID_TOKEN`: Token invalid or expired (no user found with that token)
- `500`: Server error

## Database Schema

The `verified` field in the User model:
```prisma
model User {
  // ...
  verified            Boolean   @default(false)
  verificationToken   String?
  // ...
}
```

- `verified`: Whether the user's email is verified
- `verificationToken`: Token sent in verification email (null after verification or in dev)

## Error Messages

All error messages are defined in `/constants/messages.ts`:

- `INVALID_TOKEN`: "Invalid or expired verification token"
- `TOKEN_REQUIRED`: "Verification token required"
- `EMAIL_VERIFIED`: "Email verified successfully"
- `USER_EXISTS`: "User exists"
- `MISSING_REQUIRED_FIELDS`: "missing required fields"
- `METHOD_NOT_ALLOWED`: "Method Not Allowed"

## Testing

Tests are provided in:
- `__tests__/signup.api.test.ts`: Tests signup flow in both environments
- `__tests__/verify-email.api.test.ts`: Tests token verification

Run tests:
```bash
npm test signup.api.test.ts
npm test verify-email.api.test.ts
```

## Implementation Notes

1. **Environment Detection**: Uses `process.env.NODE_ENV === 'production'`
2. **Token Generation**: Uses `crypto.randomBytes(20).toString('hex')` (40 characters)
3. **Verification Check**: Only enforced for BRAND role in production
4. **Backward Compatibility**: Returns token in all environments (empty string in dev)
5. **Error Handling**: Structured JSON responses with consistent messages

## Future Enhancements

Potential improvements not included in this minimal implementation:
- Token expiration (time-based)
- Token resend functionality
- Email sending integration
- Rate limiting for verification attempts
- Admin override to manually verify users
