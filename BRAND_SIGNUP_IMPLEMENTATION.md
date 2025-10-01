# Brand Signup Flow Implementation Summary

## Overview
This document describes the implementation of the brand signup flow that supports both local development (auto-confirm) and production (email verification) modes.

## Changes Made

### 1. Environment Configuration (`.env.example`)
Added new environment variable:
```env
AUTO_CONFIRM_BRANDS=true
```

**Purpose**: Controls whether brand accounts are auto-verified or require email confirmation.
- `true` → Local development mode (auto-confirm)
- `false` or undefined → Production mode (email verification required)

### 2. Backend API (`/pages/api/signup/brand.ts`)

**Key Changes**:
- Added logic to check `process.env.AUTO_CONFIRM_BRANDS` flag
- Two different flows based on environment:

#### Local Development Flow (AUTO_CONFIRM_BRANDS=true)
```typescript
await addUser({
  email,
  password: hashed,
  firstName,
  lastName: '',
  brandName: '',
  role: 'BRAND',
  verified: true,  // ✅ Auto-verified
});
return res.status(201).json({ token: '', autoConfirmed: true });
```

#### Production Flow (AUTO_CONFIRM_BRANDS=false)
```typescript
const token = crypto.randomBytes(20).toString('hex');
await addUser({
  email,
  password: hashed,
  firstName,
  lastName: '',
  brandName: '',
  role: 'BRAND',
  verificationToken: token,  // Token for email verification
});
return res.status(201).json({ token, autoConfirmed: false });
```

### 3. Frontend Signup Page (`/pages/signup/brand.tsx`)

**Key Changes**:
- Updated response type to include `autoConfirmed` flag
- Conditional redirect based on environment:

```typescript
const data = await signup<{ token: string; autoConfirmed?: boolean }>('/api/signup/brand', {
  firstName: values.brandName,
  email: values.email,
  password: values.password,
});

if (data.autoConfirmed) {
  // Local dev: redirect to brand dashboard
  router.push('/brand/profile?complete=1');
} else {
  // Production: redirect to confirmation page
  router.push('/brand/confirmation');
}
```

### 4. Confirmation Page (`/pages/brand/confirmation.tsx`)

**New Page Created** for production email confirmation flow.

**Features**:
- ✉️ Email icon with styled card layout
- Clear instructions to check email
- "Resend Verification Email" button
- "Go to Login" button for convenience
- Error/success message handling
- Responsive dark/light theme support

**UI Components**:
```
┌─────────────────────────────────────┐
│          📧 Envelope Icon           │
│      Check Your Email               │
│  We've sent you a verification...   │
├─────────────────────────────────────┤
│   [Resend Verification Email]       │
│   [Go to Login]                     │
└─────────────────────────────────────┘
```

### 5. User Library (`/lib/users.ts`)

**Key Changes**:
- Added `verified` parameter to `addUser` function
- Uses default value of `false` if not provided:

```typescript
export async function addUser({
  // ... other parameters
  verified,
}: UserInput): Promise<void> {
  await prisma.user.create({
    data: {
      // ... other fields
      verified: verified ?? false,  // Defaults to false
    },
  });
}
```

### 6. Type Definitions (`/types/api.ts`)

**Updated Interface**:
```typescript
export interface SignupTokenResponse {
  token: string;
  autoConfirmed?: boolean;  // New optional field
}
```

## Flow Diagrams

### Local Development Flow
```
Brand Signup Form
      ↓
API: AUTO_CONFIRM_BRANDS=true
      ↓
Create User (verified: true)
      ↓
Return { autoConfirmed: true }
      ↓
Redirect to /brand/profile?complete=1
      ↓
✅ Brand Dashboard (Ready to use)
```

### Production Flow
```
Brand Signup Form
      ↓
API: AUTO_CONFIRM_BRANDS=false
      ↓
Create User (verified: false, token: xxx)
      ↓
Return { token: 'xxx', autoConfirmed: false }
      ↓
Redirect to /brand/confirmation
      ↓
📧 "Check Your Email" Page
      ↓
User clicks email link
      ↓
/api/verify-email?token=xxx
      ↓
✅ Email Verified (verified: true)
      ↓
User can now login
```

## Testing

Created comprehensive test suite in `__tests__/brand-signup-flow.test.ts`:

✅ **7 tests passing**
- AUTO_CONFIRM_BRANDS=true behavior
- AUTO_CONFIRM_BRANDS=false behavior
- Default behavior (undefined env var)
- Frontend redirect logic for auto-confirmed
- Frontend redirect logic for email verification
- User creation with verified: true
- User creation with verified: false

## Security Considerations

1. **Production Safety**: If `AUTO_CONFIRM_BRANDS` is not set, it defaults to email verification (safer default)
2. **Token Generation**: Only generates verification tokens in production mode
3. **Verified Flag**: Explicitly controls user verification status in database

## Configuration

To enable auto-confirmation in local development:
```env
AUTO_CONFIRM_BRANDS=true
```

To require email verification (production):
```env
AUTO_CONFIRM_BRANDS=false
```

Or simply omit the variable (defaults to email verification).

## Future Enhancements

- [ ] Implement `/api/resend-verification` endpoint for the resend button
- [ ] Add email sending service integration (Resend API)
- [ ] Add token expiration handling
- [ ] Add analytics tracking for signup conversions
- [ ] Add rate limiting for resend verification attempts

## Files Modified

1. `.env.example` - Added AUTO_CONFIRM_BRANDS variable
2. `pages/api/signup/brand.ts` - Implemented dual flow logic
3. `pages/signup/brand.tsx` - Updated redirect logic
4. `pages/brand/confirmation.tsx` - Created new confirmation page
5. `lib/users.ts` - Added verified field support
6. `types/api.ts` - Updated response type
7. `__tests__/brand-signup-flow.test.ts` - Added comprehensive tests

## Acceptance Criteria Status

✅ Local dev auto-confirms brands  
✅ Production requires email verification  
✅ Clear success screen shown in production  
✅ Environment config toggle implemented  
✅ Tests passing  
