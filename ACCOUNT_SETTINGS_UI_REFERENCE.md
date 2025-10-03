# Account Settings UI Reference Guide

This document provides a visual reference for the Account Settings implementation.

## Navigation

### Settings Page Sidebar
The settings page has a sidebar with the following tabs (in order):
1. 📝 Update Profile
2. 🏪 Brand Settings (only for BRAND role users)
3. 🔑 Change Password
4. 🛡️ **Account Security** ← NEW
5. 🏠 Manage Address
6. ✉️ Change Email
7. 💳 Payment Methods
8. 🏷️ Coupons & Offers
9. 🔔 Notifications

## Account Security Tab

When users click on "Account Security" in the sidebar, they see three main sections stacked vertically:

---

### Section 1: Two-Factor Authentication (2FA) - Coming Soon

**Visual Design:**
- White card with green accent
- Shield icon in green circle on the left
- Toggle switch on the right (disabled)
- Blue info box with "Coming Soon" message

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ 🛡️  Two-Factor Authentication                           │
│     Add an extra layer of security (Coming Soon)        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Enable Two-Factor Authentication        ⚪─────○        │
│ Protect your account with an additional                 │
│ security layer                                          │
│                                                          │
│ ┌─────────────────────────────────────────────────┐    │
│ │ ℹ️ Note: Two-Factor Authentication feature is   │    │
│ │ currently under development and will be         │    │
│ │ available soon.                                 │    │
│ └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

**Colors:**
- Header icon background: Light green
- Icon: Green
- Info box: Light blue background
- Border: Gray

---

### Section 2: Deactivate Account

**Visual Design:**
- White card with yellow accent
- Warning triangle icon in yellow circle
- Two-step confirmation flow

**Layout (Initial State):**
```
┌─────────────────────────────────────────────────────────┐
│ ⚠️  Deactivate Account                                  │
│     Temporarily disable your account                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Deactivating your account will:                         │
│  • Disable your account temporarily                     │
│  • Hide your profile from other users                   │
│  • Prevent you from logging in                          │
│  • Keep your data intact for future reactivation        │
│                                                          │
│ ┌─────────────────┐                                     │
│ │ Deactivate Account │                                  │
│ └─────────────────┘                                     │
└─────────────────────────────────────────────────────────┘
```

**Layout (Confirmation State):**
```
┌─────────────────────────────────────────────────────────┐
│ ⚠️  Deactivate Account                                  │
│     Temporarily disable your account                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ... (same bullet points as above)                       │
│                                                          │
│ ┌────────────────────────────────────────────────┐     │
│ │ ⚠️ Are you sure you want to deactivate your   │     │
│ │    account?                                     │     │
│ │                                                 │     │
│ │ [Yes, Deactivate] [Cancel]                     │     │
│ └────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

**Colors:**
- Header icon background: Light yellow
- Icon: Yellow/Orange
- Button: Yellow with darker yellow on hover
- Confirmation box: Light yellow background

---

### Section 3: Delete Account

**Visual Design:**
- White card with RED accent
- Trash icon in red circle
- Three-step confirmation flow with text verification

**Layout (Initial State):**
```
┌─────────────────────────────────────────────────────────┐
│ 🗑️  Delete Account                                      │
│     Permanently delete your account                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌────────────────────────────────────────────────┐     │
│ │ ⚠️ Warning: This action cannot be undone!      │     │
│ │                                                 │     │
│ │ Deleting your account will permanently remove  │     │
│ │ all your data, including:                      │     │
│ │  • Profile information                         │     │
│ │  • Order history                               │     │
│ │  • Saved addresses                             │     │
│ │  • Payment methods                             │     │
│ │  • Wishlist items                              │     │
│ │  • All other account data                      │     │
│ └────────────────────────────────────────────────┘     │
│                                                          │
│ ┌──────────────────────────┐                            │
│ │ Delete Account Permanently │                          │
│ └──────────────────────────┘                            │
└─────────────────────────────────────────────────────────┘
```

**Layout (Confirmation State):**
```
┌─────────────────────────────────────────────────────────┐
│ 🗑️  Delete Account                                      │
│     Permanently delete your account                     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ... (same warning box as above)                         │
│                                                          │
│ ┌────────────────────────────────────────────────┐     │
│ │ This action is permanent and cannot be undone. │     │
│ │ All your data will be lost.                    │     │
│ │                                                 │     │
│ │ Type DELETE to confirm:                        │     │
│ │ [_____________________]                        │     │
│ │                                                 │     │
│ │ [Yes, Delete Forever] [Cancel]                 │     │
│ │    (disabled until "DELETE" typed)             │     │
│ └────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

**Colors:**
- Card border: Red
- Header icon background: Light red
- Icon: Red
- Warning box: Light red background with red text
- Buttons: Red with darker red on hover
- Text input: Standard with red ring on focus

---

## Change Password Tab

When users click on "Change Password" in the sidebar:

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ 🔒  Change Password                                     │
│     Update your account password                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Current Password                                         │
│ [••••••••••••••]                                        │
│ Forgot your password? ← (link to /reset)                │
│                                                          │
│ New Password                                             │
│ [••••••••••••••]                                        │
│ ▂▂▂▂▂ (password strength indicator)                    │
│ STRONG                                                   │
│                                                          │
│ Confirm Password                                         │
│ [••••••••••••••]                                        │
│                                                          │
│                               ┌──────────────────┐      │
│                               │ 🛡️ Change Password │     │
│                               └──────────────────┘      │
└─────────────────────────────────────────────────────────┘
```

**Password Strength Indicator:**
- 5 segments that fill up based on password strength
- Colors: Red (Weak) → Yellow (Fair) → Blue (Good) → Green (Strong)
- Shows text label: WEAK, FAIR, GOOD, STRONG

**Features:**
- Real-time password strength calculation
- Validation for password requirements:
  - At least 8 characters
  - At least one lowercase letter
  - At least one uppercase letter
  - At least one number
  - At least one special character
- Password confirmation matching validation
- "Forgot your password?" link redirects to `/reset` page

---

## Color Scheme Summary

| Feature | Primary Color | Usage |
|---------|--------------|-------|
| 2FA | 🟢 Green | Security/Protection |
| Deactivate | 🟡 Yellow | Caution/Warning |
| Delete | 🔴 Red | Danger/Permanent |
| Password | 🔵 Blue (Primary) | Standard action |

---

## Dark Mode Support

All sections support dark mode with appropriate color adjustments:
- White backgrounds → Dark gray
- Black text → White text
- Borders → Subtle dark borders
- Color accents maintained with adjusted opacity

---

## Responsive Design

The UI is fully responsive:
- **Desktop**: Full width cards with proper spacing
- **Mobile**: Cards stack vertically, buttons full-width on small screens
- **Tablet**: Optimized middle ground

---

## User Flow Examples

### Password Reset Flow
1. User goes to Settings → Change Password
2. Clicks "Forgot your password?" link
3. Redirected to `/reset` page
4. Enters email
5. Receives reset link
6. Sets new password

### Account Deactivation Flow
1. User goes to Settings → Account Security
2. Scrolls to "Deactivate Account" section
3. Reads warning about consequences
4. Clicks "Deactivate Account" button
5. Confirmation dialog appears
6. Clicks "Yes, Deactivate"
7. Account deactivated, user signed out
8. Redirected to homepage

### Account Deletion Flow
1. User goes to Settings → Account Security
2. Scrolls to "Delete Account" section
3. Reads strong warnings
4. Clicks "Delete Account Permanently"
5. Confirmation box appears
6. Types "DELETE" in input field
7. "Yes, Delete Forever" button becomes enabled
8. Clicks "Yes, Delete Forever"
9. Account deleted, user signed out
10. Redirected to homepage

---

## Accessibility Features

- ✅ Keyboard navigation support
- ✅ High contrast text
- ✅ Clear, descriptive labels
- ✅ Focus indicators on interactive elements
- ✅ ARIA attributes (via Heroicons)
- ✅ Screen reader friendly
- ✅ Semantic HTML structure

---

## Safety Features

### Preventing Accidents
- Multiple confirmation steps for destructive actions
- Clear, prominent warnings
- Different colors to signal severity
- Disabled states to prevent premature actions
- Text verification for permanent deletion

### Admin Protection
- Super Admin accounts cannot be deactivated
- Super Admin accounts cannot be deleted
- Proper error messages if attempted

### Post-Action Behavior
- User is automatically signed out after deactivation/deletion
- User is redirected to homepage
- Success notification shown
- Error handling with user-friendly messages

---

## Technical Implementation

### Components
- `ChangePasswordSection.tsx`: Password change form
- `AccountSecuritySection.tsx`: 2FA, Deactivate, Delete sections
- `SettingsSidebar.tsx`: Navigation sidebar

### API Endpoints
- `POST /api/change-password`: Change password
- `POST /api/user/deactivate`: Deactivate account
- `DELETE /api/user/delete`: Delete account

### State Management
- React hooks for form state
- Loading states during async operations
- Confirmation dialogs controlled by component state

### Authentication
- NextAuth session validation
- Role-based access control
- Secure API endpoints

---

## Future Enhancements (2FA)

When implementing 2FA, the placeholder section will be replaced with:
1. QR code for authenticator app setup
2. Backup codes generation
3. SMS/Email verification options
4. Recovery methods
5. Setup wizard
6. Enable/Disable toggle (functional)

The UI structure is already in place and ready for this enhancement.
