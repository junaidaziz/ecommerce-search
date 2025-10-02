# Brand Name Validation and Brand Filtering Feature

## Overview
This implementation adds two key features:
1. Brand name validation during brand signup
2. Brand filtering on the products page

## Features Implemented

### 1. Brand Name Validation on Signup

#### Backend Changes
- **New API Endpoint**: `/api/check-brand-name`
  - Accepts a `brandName` query parameter
  - Returns `{ exists: boolean }` to indicate if the brand name is already taken
  - Uses case-insensitive matching to prevent duplicate brand names with different cases

- **Updated Signup API**: `/api/signup/brand`
  - Now validates brand name before creating a new brand account
  - Returns 409 status with error message "Brand name already taken" if brand name exists
  - Uses the `findVendorByName` function with case-insensitive matching

#### Frontend Changes
- **New Hook**: `useBrandNameAvailability`
  - Similar to `useEmailAvailability` hook
  - Provides real-time validation with debouncing (500ms delay)
  - Checks brand name on blur and while typing
  - Shows validation errors inline

- **Updated Brand Signup Page**: `pages/signup/brand.tsx`
  - Integrates the new `useBrandNameAvailability` hook
  - Disables submit button while checking brand name availability
  - Shows error message if brand name is already taken

- **Updated Auth Config**: `config/auth.config.ts`
  - Added new error message: `brandNameTaken: 'Brand name already taken'`

### 2. Brand Filtering on Products Page

#### Backend Changes
- **Updated `getProductsPaginated` Function**: `lib/products.ts`
  - Added `vendorIds?: number[]` parameter to support filtering by multiple brands
  - Supports both single vendor (`vendorId`) and multiple vendors (`vendorIds`)
  - Filters products using Prisma's `{ in: vendorIds }` clause

#### Frontend Changes
- **New Component**: `BrandFilter` (`components/Product/BrandFilter.tsx`)
  - Fetches list of active brands from `/api/vendors`
  - Displays brands as checkboxes
  - Allows users to select multiple brands
  - Updates URL query parameters with selected brand IDs

- **Updated ProductFilters Component**: `components/Product/ProductFilters.tsx`
  - Added `selectedBrands` and `setSelectedBrands` props
  - Integrated the new `BrandFilter` component
  - Positioned between Categories and Price Range filters

- **Updated Products Page**: `pages/products/index.tsx`
  - Added `selectedBrands` state to track selected brand IDs
  - Updates URL with `vendor` query parameter (comma-separated IDs)
  - Includes selected brands in active filters display
  - Clears brand filters when "Clear All" is clicked
  - Syncs brand selection with URL query parameters

## API Endpoints

### Check Brand Name Availability
```
GET /api/check-brand-name?brandName=<brand_name>
```

**Response:**
```json
{
  "exists": true | false
}
```

### Get Vendors/Brands
```
GET /api/vendors?search=<search_term>&page=<page>&limit=<limit>
```

**Response:**
```json
{
  "vendors": [
    {
      "id": 1,
      "brandName": "Brand Name",
      "email": "brand@example.com",
      "active": true,
      "verified": true
    }
  ]
}
```

### Get Products with Brand Filter
```
GET /api/products?vendor=<vendor_id_1>,<vendor_id_2>&page=<page>
```

## Testing

### Manual Testing

#### Brand Name Validation
1. Navigate to brand signup page: `/signup/brand`
2. Enter an existing brand name
3. Observe error message "Brand name already taken"
4. Enter a unique brand name
5. Verify no error is shown
6. Submit the form successfully

#### Brand Filtering
1. Navigate to products page: `/products`
2. Expand the "Brands" filter section
3. Select one or more brands
4. Observe products filtered to show only selected brands
5. Check that URL updates with `vendor` query parameter
6. Verify selected brands appear in active filters
7. Click "Clear All" to reset filters

### Automated Tests
- `__tests__/check-brand-name.api.test.ts` - Tests for the brand name check API endpoint

## Future Enhancements
- Display brand names instead of IDs in active filters (requires fetching brand data)
- Add brand search functionality in the filter
- Cache brand list to reduce API calls
- Add brand slug support for cleaner URLs
- Add brand-specific landing pages
