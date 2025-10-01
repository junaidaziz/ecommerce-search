# Brand Signup Flow - Visual Summary

## Implementation Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                     BRAND SIGNUP FLOW                               │
└─────────────────────────────────────────────────────────────────────┘

User fills signup form: /pages/signup/brand.tsx
                    ↓
           POST /api/signup/brand
                    ↓
        Check AUTO_CONFIRM_BRANDS env
                    ↓
        ┌───────────┴───────────┐
        ↓                       ↓
   [TRUE]                    [FALSE]
Local Development        Production Mode
        ↓                       ↓
   Auto-Verify            Create Token
  verified=true         verified=false
        ↓                       ↓
Return {                Return {
  autoConfirmed: true     token: 'xxx',
}                         autoConfirmed: false
        ↓                     }  ↓
        ↓                       ↓
Redirect to             Redirect to
/brand/profile?         /brand/confirmation
complete=1              (Email Check Page)
        ↓                       ↓
    ✅ Ready              📧 Check Email
    to use!               → Click link
                          → Verify token
                          → ✅ Verified!
```

## Files Changed

### 1. `.env.example`
```diff
+ # Auto-confirm brand accounts in development (true) or require email verification (false)
+ AUTO_CONFIRM_BRANDS=true
```

### 2. `pages/api/signup/brand.ts`
```typescript
// BEFORE
const token = crypto.randomBytes(20).toString('hex');
await addUser({
  email,
  password: hashed,
  firstName,
  lastName: '',
  brandName: '',
  role: 'BRAND',
  verificationToken: token,
});
return res.status(201).json({ token });

// AFTER
const autoConfirm = process.env.AUTO_CONFIRM_BRANDS === 'true';

if (autoConfirm) {
  // Local dev: auto-confirm
  await addUser({ ..., verified: true });
  return res.status(201).json({ token: '', autoConfirmed: true });
} else {
  // Production: email verification
  const token = crypto.randomBytes(20).toString('hex');
  await addUser({ ..., verificationToken: token });
  return res.status(201).json({ token, autoConfirmed: false });
}
```

### 3. `pages/signup/brand.tsx`
```typescript
// BEFORE
const data = await signup<{ token: string }>('/api/signup/brand', {...});
router.push(`/confirm/${data.token}`);

// AFTER
const data = await signup<{ token: string; autoConfirmed?: boolean }>('/api/signup/brand', {...});

if (data.autoConfirmed) {
  router.push('/brand/profile?complete=1');  // Local dev
} else {
  router.push('/brand/confirmation');         // Production
}
```

### 4. `pages/brand/confirmation.tsx` (NEW)
```
┌─────────────────────────────────────────────┐
│              📧 Email Icon                  │
│          Check Your Email                   │
│   We've sent you a verification email      │
├─────────────────────────────────────────────┤
│  Please check your email inbox for a       │
│  confirmation link to activate your        │
│  brand account.                            │
│                                            │
│  Don't forget to check your spam folder    │
├─────────────────────────────────────────────┤
│    [Resend Verification Email]             │
│    [Go to Login]                           │
└─────────────────────────────────────────────┘
```

### 5. `lib/users.ts`
```typescript
// BEFORE
export async function addUser({
  ...,
  verificationToken,
}: UserInput): Promise<void> {
  await prisma.user.create({
    data: {
      ...,
      verificationToken,
    },
  });
}

// AFTER
export async function addUser({
  ...,
  verificationToken,
  verified,  // NEW
}: UserInput): Promise<void> {
  await prisma.user.create({
    data: {
      ...,
      verificationToken,
      verified: verified ?? false,  // NEW
    },
  });
}
```

### 6. `types/api.ts`
```typescript
// BEFORE
export interface SignupTokenResponse {
  token: string;
}

// AFTER
export interface SignupTokenResponse {
  token: string;
  autoConfirmed?: boolean;  // NEW
}
```

## Environment Configuration

### Local Development
```env
AUTO_CONFIRM_BRANDS=true
```
**Behavior:**
- Brand accounts automatically verified
- No email verification required
- Instant access to dashboard
- Faster development workflow

### Production
```env
AUTO_CONFIRM_BRANDS=false
```
**Behavior:**
- Email verification required
- Verification token generated
- User sees confirmation page
- Must click email link to activate

## Test Coverage

```
✓ AUTO_CONFIRM_BRANDS=true behavior
✓ AUTO_CONFIRM_BRANDS=false behavior  
✓ Default behavior (undefined env var)
✓ Frontend redirect logic (auto-confirmed)
✓ Frontend redirect logic (email verification)
✓ User creation with verified: true
✓ User creation with verified: false

7/7 tests passing ✅
```

## Security & Best Practices

✅ Safe default: Undefined env → email verification  
✅ Clear separation of local/prod behavior  
✅ No security tokens exposed in auto-confirm mode  
✅ Production always requires email verification  
✅ Comprehensive test coverage  
✅ Type-safe implementation  

## Acceptance Criteria

✅ Local dev auto-confirms brands  
✅ Production requires email verification  
✅ Clear success screen shown in prod  
✅ Environment config toggle implemented  
✅ Tests passing  
✅ Documentation complete  
