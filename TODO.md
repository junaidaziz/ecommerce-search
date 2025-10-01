# 🚀 TODO – Brand Signup Flow Fixes

## [Epic] Fix Brand Signup Flow (UI/UX + API + DB)

- [ ] Task 1: Fix Brand Signup Logic  
  - Local dev → auto-confirm brands (`isVerified = true`).  
  - Prod → require email confirmation with token.  
  - Redirect: Local → dashboard | Prod → “Check your email” page.  
  - Add `.env` config toggle for confirm mode.  

- [ ] Task 2: Brand Signup UI/UX  
  - Replace "First Name" → "Brand Name".  
  - Validation → “Brand name is required”.  
  - Show errors only on blur/submit (no duplicates).  
  - Auth/global errors left-aligned in styled alert.  

- [ ] Task 3: Confirm Email Page  
  - Create styled ConfirmationPage (title, instructions, resend button).  
  - Show illustration (envelope/checkmark).  
  - On error → show styled alert with retry option.  

- [ ] Task 4: Brand Header UI/UX  
  - Fix layout: align logo, nav items, spacing.  
  - Categories dropdown: white default, readable hover contrast.  
  - Support both light/dark themes.  

- [ ] Task 5: Backend API + DB  
  - Ensure tokens generated only in prod.  
  - Local → skip token creation, auto-confirm.  
  - DB flag `isVerified` updates correctly.  
  - Handle expired/invalid tokens with clear error JSON.  

- [ ] Task 6: Centralize Auth Messages  
  - Create `<FormError />` + `<AuthMessage />` reusable components.  
  - Move placeholders/labels/messages into `auth.config.ts`.  
  - Ensure consistent design system usage.  
