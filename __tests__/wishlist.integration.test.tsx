import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserWishlist from '@/pages/user/wishlist';
import { AppContext } from '@contexts/AppContext';
import type { AppContextValue, WishlistItem, Product } from '@/types';

// Mock Next.js modules
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/user/wishlist',
    events: { on: jest.fn(), off: jest.fn() },
  }),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, className }: any) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

jest.mock('next/head', () => ({
  __esModule: true,
  default: ({ children }: any) => <>{children}</>,
}));

const mockProduct: Product = {
  id: 1,
  uuid: 'test-uuid-1',
  sku: 'TEST-001',
  slug: 'test-product',
  title: 'Test Product',
  description: 'A test product',
  productType: 'physical',
  tags: 'test,product',
  quantity: 10,
  minPrice: 99.99,
  maxPrice: 99.99,
  currency: 'USD',
  discountType: null,
  discountValue: null,
  status: 'published',
  vendorId: 1,
  categoryId: 1,
  images: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  brandId: null,
  bodyHtml: null,
  handle: 'test-product',
  featuredImage: null,
  options: null,
  publishedAt: new Date(),
  publishedScope: null,
  templateSuffix: null,
  variants: null,
};

const mockWishlistItem: WishlistItem = {
  id: 1,
  userId: 1,
  productId: 1,
  variantId: null,
  notifyOnStock: false,
  createdAt: new Date(),
  product: mockProduct,
} as any;

const createMockContext = (
  overrides?: Partial<AppContextValue>
): AppContextValue => ({
  user: { id: 1, email: 'test@test.com' } as any,
  wishlist: [],
  cart: [],
  login: jest.fn(),
  signup: jest.fn(),
  logout: jest.fn(),
  addToCart: jest.fn(),
  changeQty: jest.fn(),
  removeFromCart: jest.fn(),
  clearCart: jest.fn(),
  addToWishlist: jest.fn(),
  removeFromWishlist: jest.fn(),
  placeOrder: jest.fn(),
  isInCart: jest.fn(),
  getCartItemQuantity: jest.fn(),
  mergeCarts: jest.fn(),
  ...overrides,
});

describe('UserWishlist Integration', () => {
  it('should call removeFromWishlist when heart button is clicked', async () => {
    const mockRemoveFromWishlist = jest.fn();
    const mockContext = createMockContext({
      wishlist: [mockWishlistItem],
      removeFromWishlist: mockRemoveFromWishlist,
    });
    
    render(
      <AppContext.Provider value={mockContext}>
        <UserWishlist />
      </AppContext.Provider>
    );

    // Find and click the wishlist button
    const wishlistButtons = screen.getAllByRole('button', { name: /remove from wishlist/i });
    expect(wishlistButtons.length).toBeGreaterThan(0);
    
    fireEvent.click(wishlistButtons[0]);
    
    await waitFor(() => {
      expect(mockRemoveFromWishlist).toHaveBeenCalledWith(1);
    });
  });

  it('should call addToCart when Add to Cart button is clicked', async () => {
    const mockAddToCart = jest.fn();
    const mockContext = createMockContext({
      wishlist: [mockWishlistItem],
      addToCart: mockAddToCart,
    });
    
    render(
      <AppContext.Provider value={mockContext}>
        <UserWishlist />
      </AppContext.Provider>
    );

    // Find and click the Add to Cart button
    const addToCartButtons = screen.getAllByRole('button', { name: /add to cart/i });
    expect(addToCartButtons.length).toBeGreaterThan(0);
    
    fireEvent.click(addToCartButtons[0]);
    
    await waitFor(() => {
      expect(mockAddToCart).toHaveBeenCalledWith(mockProduct);
    });
  });

  it('should maintain grid layout with responsive classes', () => {
    const mockContext = createMockContext({
      wishlist: [mockWishlistItem],
    });
    
    const { container } = render(
      <AppContext.Provider value={mockContext}>
        <UserWishlist />
      </AppContext.Provider>
    );

    // Check for responsive grid classes
    const gridElement = container.querySelector('.grid');
    expect(gridElement).toBeInTheDocument();
    expect(gridElement?.className).toMatch(/grid-cols-1/);
    expect(gridElement?.className).toMatch(/sm:grid-cols-2/);
    expect(gridElement?.className).toMatch(/lg:grid-cols-3/);
    expect(gridElement?.className).toMatch(/xl:grid-cols-4/);
    expect(gridElement?.className).toMatch(/2xl:grid-cols-5/);
  });

  it('should show all product details in card format', () => {
    const mockContext = createMockContext({
      wishlist: [mockWishlistItem],
    });
    
    render(
      <AppContext.Provider value={mockContext}>
        <UserWishlist />
      </AppContext.Provider>
    );

    // Verify product title is visible
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    
    // Verify both buttons are present
    expect(screen.getByRole('button', { name: /remove from wishlist/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument();
  });
});
