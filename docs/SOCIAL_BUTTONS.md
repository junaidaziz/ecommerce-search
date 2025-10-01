# Social Login Buttons - Hover Effects Documentation

## Overview
This document describes the hover effects and styling guidelines for social login buttons (Google, Facebook, GitHub) in the application.

## Implemented Features

### 1. Consistent Hover States
All social login buttons now have consistent and smooth hover effects that provide clear visual feedback to users.

### 2. Provider-Specific Styling

#### Google Button
- **Light Mode:**
  - Background: White → Very light gray (#f8f9fa) on hover
  - Border: Gray (#d1d5db) → Google Blue (#4285F4) on hover
  - Text: Dark gray → Google Blue (#4285F4) on hover
  - Shadow: Subtle blue shadow (rgba(66,133,244,0.15))

- **Dark Mode:**
  - Background: Dark gray (#1f2937) → Very dark (#1a1a1a) on hover
  - Border: Medium gray → Google Blue (#4285F4) on hover
  - Text: Light gray → Google Blue (#4285F4) on hover
  - Shadow: Same blue shadow

#### Facebook Button
- **Light Mode:**
  - Background: White → Facebook Blue (#1877F2) on hover
  - Border: Gray → Facebook Blue (#1877F2) on hover
  - Text: Dark gray → White on hover
  - Shadow: Blue shadow (rgba(24,119,242,0.25))

- **Dark Mode:**
  - Background: Dark gray → Facebook Blue (#1877F2) on hover
  - Border: Medium gray → Facebook Blue (#1877F2) on hover
  - Text: Light gray → White on hover
  - Shadow: Same blue shadow

#### GitHub Button
- **Light Mode:**
  - Background: White → GitHub Dark (#24292e) on hover
  - Border: Gray → GitHub Dark (#24292e) on hover
  - Text: Dark gray → White on hover
  - Shadow: Dark shadow (rgba(36,41,46,0.2))

- **Dark Mode:**
  - Background: Dark gray → GitHub Darkest (#0d1117) on hover
  - Border: Medium gray → GitHub Blue (#58a6ff) on hover
  - Text: Light gray → White on hover
  - Shadow: Blue shadow (rgba(88,166,255,0.15))

### 3. Transition Timing
- **Duration:** 300ms (0.3s)
- **Easing:** ease-in-out
- **Properties:** All (background, border, shadow, text color, scale)

### 4. Additional Effects
- **Scale:** 1.02x on hover (subtle lift effect)
- **Active State:** 0.98x scale (button press effect)
- **Focus State:** Ring effect matching brand color with 20% opacity

## Brand Guidelines Compliance

### Google
- Primary color: #4285F4 (Google Blue)
- Uses subtle background tint on hover
- Maintains brand recognition with blue accents

### Facebook
- Primary color: #1877F2 (Facebook Blue)
- Full color transformation on hover
- Strong brand association

### GitHub
- Light mode: #24292e (GitHub Dark)
- Dark mode: #58a6ff (GitHub Blue)
- Adapts to theme while maintaining brand identity

## Accessibility
- Clear visual feedback on hover and focus
- Sufficient color contrast in all states
- Focus ring for keyboard navigation
- Semantic button elements

## Consistency
- All buttons use the same transition duration
- Consistent padding and spacing (gap-3)
- Uniform font weight (semibold) and size (text-base)
- Icons aligned with text using flexbox

## Usage Example

```tsx
import SocialButton from '@components/UI/SocialButton';
import GoogleIcon from '@components/icons/GoogleIcon';
import FacebookIcon from '@components/icons/FacebookIcon';
import GithubIcon from '@components/icons/GithubIcon';

// Google Button
<SocialButton
  icon={<GoogleIcon className="h-5 w-5" />}
  provider="Google"
  onClick={() => signIn('google')}
>
  Continue with Google
</SocialButton>

// Facebook Button
<SocialButton
  icon={<FacebookIcon className="h-5 w-5" />}
  provider="Facebook"
  onClick={() => signIn('facebook')}
>
  Continue with Facebook
</SocialButton>

// GitHub Button
<SocialButton
  icon={<GithubIcon className="h-5 w-5" />}
  provider="GitHub"
  onClick={() => signIn('github')}
>
  Continue with GitHub
</SocialButton>
```

## Testing
Comprehensive tests are available in `__tests__/SocialButton.test.tsx` covering:
- Rendering with different providers
- Custom text support
- Hover transition styles
- Icon and text alignment
