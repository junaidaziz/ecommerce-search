# Product Components Documentation

This directory contains reusable product-related components following a props-driven design pattern.

## Reusable Components

### ProductCard Components

The ProductCard has been refactored into smaller, reusable sub-components:

#### 1. ProductImage
**File:** `ProductImage.tsx`

Displays product images with a slider.

**Props:**
- `images: { url: string; alt?: string }[]` - Array of image objects
- `className?: string` - Optional additional CSS classes

**Usage:**
```tsx
<ProductImage images={[{ url: '/image.jpg', alt: 'Product' }]} />
```

#### 2. ProductBadges
**File:** `ProductBadges.tsx`

Displays product badges (New, Rating, Stock Status).

**Props:**
- `isNew?: boolean` - Whether to show the "New" badge
- `rating?: number` - Product rating (0-5)
- `stockStatus: string` - Stock status ("In Stock", "Low Stock", "Out of Stock")

**Usage:**
```tsx
<ProductBadges isNew={true} rating={4} stockStatus="In Stock" />
```

#### 3. ProductInfo
**File:** `ProductInfo.tsx`

Displays product title with a link to the product detail page.

**Props:**
- `slug: string` - Product URL slug
- `title: string` - Product title

**Usage:**
```tsx
<ProductInfo slug="product-slug" title="Product Name" />
```

#### 4. ProductPrice
**File:** `ProductPrice.tsx`

Displays product price with optional strikethrough for discounts.

**Props:**
- `minPrice: number` - Product price
- `maxPrice?: number` - Optional original price (for strikethrough)

**Usage:**
```tsx
<ProductPrice minPrice={99.99} maxPrice={149.99} />
```

#### 5. WishlistButton
**File:** `WishlistButton.tsx`

Heart icon button for adding/removing items from wishlist.

**Props:**
- `inWishlist: boolean` - Whether item is in wishlist
- `onToggle: (e: React.MouseEvent) => void` - Toggle handler

**Usage:**
```tsx
<WishlistButton inWishlist={false} onToggle={handleToggle} />
```

### ProductFilters Components

The ProductFilters has been refactored into smaller, reusable filter components:

#### 1. FilterSection
**File:** `FilterSection.tsx`

Reusable container for filter groups with optional icon and label.

**Props:**
- `label: string` - Filter section label
- `icon?: React.ReactNode` - Optional icon element
- `children: React.ReactNode` - Filter content
- `className?: string` - Optional additional CSS classes
- `noBorder?: boolean` - Whether to hide bottom border

**Usage:**
```tsx
<FilterSection label="Price" icon={<DollarIcon />}>
  <input type="number" />
</FilterSection>
```

#### 2. SearchFilter
**File:** `SearchFilter.tsx`

Keyword search input field for filtering products.

**Props:**
- `keyword: string` - Current search keyword
- `setKeyword: React.Dispatch<React.SetStateAction<string>>` - State setter

**Usage:**
```tsx
<SearchFilter keyword={keyword} setKeyword={setKeyword} />
```

#### 3. AvailabilityFilter
**File:** `AvailabilityFilter.tsx`

Checkbox for filtering in-stock products only.

**Props:**
- `inStock: boolean` - Current in-stock filter state
- `setInStock: React.Dispatch<React.SetStateAction<boolean>>` - State setter

**Usage:**
```tsx
<AvailabilityFilter inStock={inStock} setInStock={setInStock} />
```

#### 4. CategoryFilter
**File:** `CategoryFilter.tsx`

Checkbox list for filtering by categories.

**Props:**
- `categories: Category[]` - Array of category objects
- `selectedCategories: string[]` - Array of selected category slugs
- `setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>` - State setter

**Usage:**
```tsx
<CategoryFilter 
  categories={categories} 
  selectedCategories={selected} 
  setSelectedCategories={setSelected} 
/>
```

#### 5. PriceRangeFilter
**File:** `PriceRangeFilter.tsx`

Min/max price input fields for filtering by price range.

**Props:**
- `minPrice: string` - Minimum price value
- `setMinPrice: React.Dispatch<React.SetStateAction<string>>` - Min price setter
- `maxPrice: string` - Maximum price value
- `setMaxPrice: React.Dispatch<React.SetStateAction<string>>` - Max price setter

**Usage:**
```tsx
<PriceRangeFilter 
  minPrice={minPrice} 
  setMinPrice={setMinPrice} 
  maxPrice={maxPrice} 
  setMaxPrice={setMaxPrice} 
/>
```

## Benefits of Refactoring

1. **Reduced Complexity**
   - ProductCard: Reduced from 193 to 132 lines (31.6% reduction)
   - ProductFilters: Reduced from 161 to 84 lines (47.8% reduction)

2. **Improved Reusability**
   - Each component is self-contained and can be used independently
   - Props-driven design makes components flexible

3. **Better Maintainability**
   - Easier to update individual components
   - Clearer separation of concerns

4. **Enhanced Testability**
   - Smaller components are easier to test in isolation
   - More focused unit tests possible

## Component Composition

### ProductCard Example
```tsx
<ProductCard product={product}>
  <WishlistButton inWishlist={false} onToggle={handleToggle} />
  <ProductImage images={product.images} />
  <ProductBadges isNew={true} rating={4} stockStatus="In Stock" />
  <ProductInfo slug={product.slug} title={product.title} />
  <ProductPrice minPrice={product.minPrice} maxPrice={product.maxPrice} />
</ProductCard>
```

### ProductFilters Example
```tsx
<ProductFilters>
  <SearchFilter keyword={keyword} setKeyword={setKeyword} />
  <AvailabilityFilter inStock={inStock} setInStock={setInStock} />
  <CategoryFilter categories={categories} selectedCategories={selected} setSelectedCategories={setSelected} />
  <PriceRangeFilter minPrice={minPrice} setMinPrice={setMinPrice} maxPrice={maxPrice} setMaxPrice={setMaxPrice} />
</ProductFilters>
```

## Design Principles

1. **Single Responsibility**: Each component has one clear purpose
2. **Props-Driven**: All data and behavior is passed via props
3. **Composable**: Components can be combined in different ways
4. **Consistent API**: Similar components follow the same prop patterns
5. **Accessible**: All components maintain proper accessibility attributes
