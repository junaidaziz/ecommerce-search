# Product Error Handling - Visual Summary

## Overview
This document describes the visual appearance and behavior of the new error handling for product pages.

## ProductError Component

The `ProductError` component provides a consistent, themed error display for product pages with two types of errors:
- **404 Not Found**: When a product doesn't exist
- **API Error**: When there's a server/database failure

### Visual Design

#### Layout
- Centered vertically and horizontally on the page
- Minimum height of 60vh for proper spacing
- Maximum width of 28rem (448px) for optimal readability
- Responsive padding (px-4 py-12)

#### Elements

1. **Icon** (24 x 24)
   - **404 Error**: Sad face icon in muted color (`text-base-content/20`)
   - **API Error**: Warning triangle icon in error color (`text-error/70`)
   - Proper ARIA attributes (`aria-hidden="true"`)

2. **Title** (text-3xl font-bold)
   - **404**: "Product Not Found"
   - **API Error**: "Error Loading Product"
   - Uses theme color (`text-base-content`)

3. **Message** (text-lg)
   - Default or custom message
   - Slightly muted color (`text-base-content/70`)
   - **404 Default**: "The product you are looking for could not be found."
   - **API Error Default**: "We encountered an error loading this product. Please try again later."

4. **Action Buttons**
   - Flex layout (column on mobile, row on desktop)
   - Gap-4 spacing between buttons
   - **Go Back** button: `btn btn-outline` (optional, controlled by `showBackButton` prop)
   - **Browse Products** button: `btn btn-primary` (links to `/products`)

5. **Additional Help** (API Errors Only)
   - Background: `bg-base-200`
   - Padding: p-4
   - Rounded corners
   - Text: Small, muted (`text-sm text-base-content/60`)
   - Message: "If this problem persists, please contact support or try refreshing the page."

## Theme Integration

The component uses DaisyUI theme classes for consistent styling:
- `base-content`: Main text color
- `base-200`: Background for help section
- `error`: Error state color
- `btn btn-primary`: Primary action button
- `btn btn-outline`: Secondary action button

## Accessibility

- Icons include `aria-hidden="true"` to prevent screen reader confusion
- Semantic HTML structure
- Proper color contrast ratios
- Keyboard navigable buttons
- Clear, descriptive text

## Usage Examples

### Client-Side Product Page (`/pages/products/[id].tsx`)

```tsx
// 404 Error
if (error && errorType === 'not-found') {
  return (
    <>
      <Head>
        <title>{getPageTitle('Product Not Found')}</title>
      </Head>
      <ProductError type="not-found" message={error} />
    </>
  );
}

// API Error
if (error && errorType === 'api-error') {
  return (
    <>
      <Head>
        <title>{getPageTitle('Error')}</title>
      </Head>
      <ProductError type="api-error" message={error} />
    </>
  );
}
```

### Server-Side Product Page (`/pages/product/[slug].tsx`)

The server-side page uses Next.js's built-in 404 page for not found products by returning `{ notFound: true }` from `getServerSideProps`. This ensures consistency with the framework's error handling.

## Error Flow

### Client-Side Page (`/products/[id]`)
1. Component mounts, fetches product by ID
2. If 404 response → Show ProductError with type="not-found"
3. If other error → Show ProductError with type="api-error"
4. If no error → Display product details

### Server-Side Page (`/product/[slug]`)
1. getServerSideProps fetches product by slug
2. If not found → Return { notFound: true } → Next.js 404 page
3. If database error → Return { notFound: true } → Next.js 404 page (for security)
4. If success → Render product page with data

### API Route (`/api/products/[uuid]`)
1. Validate UUID parameter
2. Query database by UUID
3. If not found → 404 JSON response
4. If found → Return product with reviews/ratings (using row.id, not uuid)
5. If error → 500 JSON response

## Key Improvements

1. **Consistent Design**: All error states now use the same styled component
2. **Clear User Messaging**: Distinguishes between "not found" and "API errors"
3. **Actionable**: Users can go back or browse other products
4. **Accessible**: Proper ARIA attributes and semantic HTML
5. **Theme-Aware**: Uses DaisyUI theme colors for light/dark mode support
6. **Bug Fixed**: API route now correctly uses row.id instead of uuid for ratings
7. **Error Handling**: Server-side page now catches and handles database errors gracefully
