# Brand Signup Flow - Quick Start Guide

## 🚀 For Developers

### Setup Environment

#### Local Development (Auto-Confirm)
```bash
# Add to .env
AUTO_CONFIRM_BRANDS=true
```
✅ Brands automatically verified  
✅ No email required  
✅ Direct access to dashboard  

#### Production (Email Verification)
```bash
# Add to .env
AUTO_CONFIRM_BRANDS=false
# OR omit the variable (safe default)
```
✅ Email verification required  
✅ Secure production flow  
✅ Confirmation page shown  

### Test Your Changes
```bash
npm test -- __tests__/brand-signup-flow.test.ts
```

### User Flow

#### Local Dev Flow
```
1. User fills signup form at /signup/brand
2. Submit → API creates user with verified=true
3. Redirect → /brand/profile?complete=1
4. ✅ Ready to use dashboard
```

#### Production Flow
```
1. User fills signup form at /signup/brand
2. Submit → API creates user + token
3. Redirect → /brand/confirmation
4. User checks email
5. Click verification link
6. ✅ Account verified, can login
```

## 📁 Key Files

### Backend
- `pages/api/signup/brand.ts` - Signup API with dual logic
- `lib/users.ts` - User creation with verified field

### Frontend
- `pages/signup/brand.tsx` - Signup form with smart redirect
- `pages/brand/confirmation.tsx` - Email confirmation page

### Configuration
- `.env.example` - Environment variable documentation

### Tests
- `__tests__/brand-signup-flow.test.ts` - Test suite (7 tests)

## 🔍 Quick Checks

### Is auto-confirm enabled?
```typescript
const autoConfirm = process.env.AUTO_CONFIRM_BRANDS === 'true';
```

### What happens after signup?
```typescript
if (data.autoConfirmed) {
  // Local: Go to dashboard
  router.push('/brand/profile?complete=1');
} else {
  // Production: Show email confirmation
  router.push('/brand/confirmation');
}
```

## 🐛 Troubleshooting

### Brands not auto-confirming in local dev?
Check: `AUTO_CONFIRM_BRANDS=true` in `.env`

### Brands auto-confirming in production?
Check: `AUTO_CONFIRM_BRANDS` should be `false` or omitted

### Tests failing?
```bash
npm test -- __tests__/brand-signup-flow.test.ts
```

## 📚 Full Documentation

- `IMPLEMENTATION_SUMMARY.md` - Complete overview
- `BRAND_SIGNUP_IMPLEMENTATION.md` - Technical details
- `BRAND_SIGNUP_VISUAL_SUMMARY.md` - Flow diagrams

---

**Need help?** Check the full documentation files above! 📖
