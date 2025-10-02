# API Types Refactoring Summary

## Overview
Refactored API response types from a single monolithic file (`types/api.ts`) into domain-specific files organized in the `types/api/` directory.

## Changes Made

### 1. Created Domain-Specific Type Files

Organized API response types into 7 domain-specific files:

#### **types/api/products.types.ts** (38 lines)
- `SearchResults` - Simple search results with product array
- `ProductsResponse` - Paginated products response
- `SuggestionsResponse` - Search suggestions
- `SearchApiResponse` - Full search API response with filters
- `TrendingResponse` - Trending keywords
- `TagsResponse` - Available tags

#### **types/api/orders.types.ts** (16 lines)
- `CheckoutSessionResponse` - Stripe checkout session
- `OrderIdResponse` - Order ID wrapper
- `OrderPlacedResponse` - Order placement confirmation

#### **types/api/auth.types.ts** (33 lines)
- `LoginResponse` - Login result
- `SignupResponse` - Signup result with user and token
- `SignupTokenResponse` - Email verification token
- `ResetTokenResponse` - Password reset token
- `EmailChangeTokensResponse` - Email change tokens

#### **types/api/users.types.ts** (6 lines)
- `UsersResponse` - List of users with admin fields

#### **types/api/categories.types.ts** (25 lines)
- `CategoriesResponse` - List of categories
- `CategoryResponse` - Single category
- `CategoryCheckResponse` - Category existence check
- `CategoryCheckOrCreateResponse` - Category check or create result

#### **types/api/vendors.types.ts** (6 lines)
- `VendorsResponse` - List of vendors

#### **types/api/coupons.types.ts** (4 lines)
- `CouponResponse` - Coupon data

### 2. Created Barrel Export File

**types/api/index.ts** (20 lines) - Re-exports all domain-specific types in one place

### 3. Updated Central Type Export

**types/index.ts** - Modified to:
- Export API types explicitly by name (to avoid conflicts)
- Handle naming conflicts with existing types:
  - API `SearchResults` takes precedence over generic `SearchResults<T>` from shared.ts
  - API `CouponResponse` takes precedence over `CouponResponse` from coupon.ts
- Explicitly export non-conflicting types from coupon.ts and shared.ts

### 4. Removed Old File

Deleted `types/api.ts` (129 lines) - All types moved to domain-specific files

## Benefits

### ✅ Better Organization
- Types grouped by domain (products, orders, auth, etc.)
- Easier to find and maintain related types
- Clear separation of concerns

### ✅ Scalability
- Easy to add new types to appropriate domain files
- Each file is small and focused (4-38 lines)
- New domains can be added as new files

### ✅ No Breaking Changes
- All imports from `@/types` still work
- Type names unchanged
- No updates needed to consuming code

### ✅ No Circular Dependencies
- Domain type files only import from sibling type files (product, user, category, etc.)
- Clean import hierarchy maintained

## File Structure

```
types/
├── api/
│   ├── index.ts                 # Barrel export file
│   ├── products.types.ts        # Product-related API responses
│   ├── orders.types.ts          # Order-related API responses
│   ├── auth.types.ts            # Authentication API responses
│   ├── users.types.ts           # User-related API responses
│   ├── categories.types.ts      # Category-related API responses
│   ├── vendors.types.ts         # Vendor-related API responses
│   └── coupons.types.ts         # Coupon-related API responses
├── index.ts                     # Central export (updated)
└── [other type files...]
```

## Usage Examples

### Before
```typescript
// Deep import (would have worked but not preferred)
import { ProductsResponse } from '@/types/api';

// Central import (current way)
import { ProductsResponse } from '@/types';
```

### After
```typescript
// Still works the same way - no changes needed
import { ProductsResponse } from '@/types';

// Can also import from domain-specific file if needed
import { ProductsResponse } from '@/types/api/products.types';

// Or from api barrel
import { ProductsResponse } from '@/types/api';
```

### Multiple Imports
```typescript
// Import related types together
import {
  SearchResults,
  ProductsResponse,
  SuggestionsResponse,
} from '@/types';

// Or from specific domain
import {
  CheckoutSessionResponse,
  OrderPlacedResponse,
} from '@/types/api/orders.types';
```

## Verification

### Type Safety ✅
- All type checks pass (no new errors introduced)
- Only pre-existing Prisma-related errors remain
- Strict type safety maintained

### Import Compatibility ✅
- All existing imports from `@/types` work unchanged
- Verified with actual API route files:
  - `pages/api/products/index.ts` - imports `ProductsResponse`
  - `pages/api/signup.ts` - imports `SignupResponse`
  - `pages/api/vendors.ts` - imports `VendorsResponse`

### No Circular Dependencies ✅
- Confirmed clean import hierarchy
- API types only depend on base types (Product, User, Category, etc.)
- No back-references from base types to API types

## Metrics

- **Total lines removed**: 129 (old api.ts)
- **Total lines added**: 148 (7 domain files + 1 barrel file)
- **Net change**: +19 lines (better organization with minimal overhead)
- **Files created**: 8 new files
- **Files modified**: 1 (types/index.ts)
- **Files deleted**: 1 (types/api.ts)

## Migration Path for Future Changes

When adding new API response types:

1. Identify the domain (products, orders, auth, users, categories, vendors, coupons)
2. Add the type to the appropriate `types/api/{domain}.types.ts` file
3. The type is automatically re-exported through the barrel file
4. Add explicit export to `types/index.ts` if needed (to handle naming conflicts)

Example:
```typescript
// In types/api/products.types.ts
export interface NewProductResponse {
  // ... fields
}

// Already exported via:
// types/api/index.ts (export * from './products.types')
// types/index.ts (export type { ..., NewProductResponse } from './api')
```
