# Style Refactoring - Custom CSS for Unique Cases

## Overview

This document outlines the refactoring done to extract one-off styles, special margins, alignments, and overrides from component files into a dedicated CSS file for better maintainability and cleaner component code.

## Changes Made

### 1. Created `styles/overrides.css`

A new dedicated CSS file was created to contain all one-off styles and special cases. This file is now imported in `pages/_app.tsx` after the global and custom CSS files.

### 2. Extracted CSS Classes

The following reusable CSS classes were created in `overrides.css`:

#### Status Badges
- `.status-badge` - Base badge style
- `.status-badge-success` - Green badge for success states
- `.status-badge-warning` - Yellow badge for warning states
- `.status-badge-danger` - Red badge for danger/error states
- `.status-badge-info` - Blue badge for informational states
- `.status-badge-neutral` - Gray badge for neutral states
- `.status-badge-emerald` - Emerald badge for brand-specific states

#### Avatar Styles
- `.avatar-circle` - Base circular avatar container
- `.avatar-circle-emerald` - Emerald colored avatar
- `.avatar-image` - Circular avatar image
- `.avatar-placeholder` - Placeholder avatar when no image exists

#### Positioning
- `.edit-button-top-right` - Top-right positioned edit button
- `.button-top-right-sm` - Small button positioned at top-right
- `.button-top-right-corner` - Generic top-right corner button

#### Gradient Backgrounds
- `.hero-gradient` - Green-blue hero gradient
- `.brand-panel-gradient` - Blue-purple-indigo brand panel gradient
- `.signup-gradient-overlay` - Subtle signup page gradient overlay
- `.hover-gradient-overlay` - Gradient that appears on hover
- `.hero-image-overlay` - Dark gradient overlay for hero images

#### Layout & Components
- `.profile-container` - Profile page container with specific styling
- `.info-card` - Information card used in profile sections
- `.product-thumbnail-sm` - Small product image thumbnail
- `.order-detail-card` - Order detail card styling

### 3. Updated Components

The following components were updated to use the new CSS classes instead of inline styles:

#### Admin Pages
- `pages/admin/brands.tsx` - Status badges for brand role, active/inactive, and verification status
- `pages/admin/users.tsx` - Status badges for user roles and disabled/active status
- `pages/admin/products.tsx` - Status badges for stock levels and product status

#### Profile & User Pages
- `components/pages/ProfilePage.tsx` - Avatar, role badge, edit button, info cards, and container
- `components/ProfileAvatarUploader.tsx` - Avatar images and placeholder
- `pages/orders/[orderId].tsx` - Order status badges and product thumbnails

#### UI Components
- `components/UI/PageHero.tsx` - Hero gradient background
- `components/Product/WishlistButton.tsx` - Top-right button positioning

#### Brand Pages
- `pages/brand/dashboard.tsx` - Brand panel gradient
- `pages/brand/orders.tsx` - Brand panel gradient
- `pages/brand/products/new.tsx` - Brand panel gradient
- `components/brand/BrandProductsPage.tsx` - Brand panel gradient

#### Other Pages
- `pages/dashboard.tsx` - Hero gradient
- `pages/signup/index.tsx` - Signup gradient overlay
- `components/Hero.tsx` - Hero image overlay

## Benefits

1. **Cleaner Component Code**: Components are now more focused on their logic and structure rather than styling details
2. **Consistency**: Reusable CSS classes ensure consistent styling across the application
3. **Maintainability**: Changes to special styles can be made in one place rather than searching through multiple component files
4. **Better Separation of Concerns**: Styling concerns are separated from component logic
5. **Easier Testing**: Components are easier to test without complex inline style logic
6. **Performance**: CSS classes are more performant than inline styles
7. **Dark Mode Support**: All badge and avatar styles include dark mode variants

## Usage Examples

### Before
```tsx
<span className="inline-block px-3 py-1 rounded-full text-xs font-semibold tracking-wide bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
  Active
</span>
```

### After
```tsx
<span className="status-badge status-badge-success">
  Active
</span>
```

### Before
```tsx
<div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg border-4 border-white">
  JD
</div>
```

### After
```tsx
<div className="avatar-circle avatar-circle-emerald">
  JD
</div>
```

## File Structure

```
styles/
├── globals.css        # Global styles and base Tailwind
├── custom.css         # CSS custom properties and theme variables
├── overrides.css      # One-off styles and special cases (NEW)
└── category-dropdown.css  # Category-specific styles
```

## Future Considerations

- Consider creating a Storybook or component documentation showing all available CSS classes
- Consider migrating to SCSS if more complex style logic is needed
- Keep monitoring for new repeated patterns that could be extracted to `overrides.css`
