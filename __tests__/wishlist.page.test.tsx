import React from 'react';
import { render, screen } from '@testing-library/react';
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

// Mock ProductCard component
jest.mock('@components/Product/ProductCard', () => ({
  __esModule: true,
  default: ({ product, inWishlist, removeFromWish }: any) => (
    <div data-testid={`product-card-${product.id}`}>
      <h3>{product.title}</h3>
      <p>${product.minPrice}</p>
      <button onClick={() => removeFromWish(product.id)}>Remove</button>
      {inWishlist && <span data-testid="in-wishlist">In Wishlist</span>}
    </div>
  ),
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

describe('UserWishlist Page', () => {
  it('should show login message when user is not logged in', () => {
    const mockContext = createMockContext({ user: null });
    
    render(
      <AppContext.Provider value={mockContext}>
        <UserWishlist />
      </AppContext.Provider>
    );

    expect(screen.getByText('Please log in to view wishlist.')).toBeInTheDocument();
  });

  it('should show empty state when wishlist is empty', () => {
    const mockContext = createMockContext({ wishlist: [] });
    
    render(
      <AppContext.Provider value={mockContext}>
        <UserWishlist />
      </AppContext.Provider>
    );

    expect(screen.getByText('My Wishlist')).toBeInTheDocument();
    expect(screen.getByText('No items in wishlist.')).toBeInTheDocument();
  });

  it('should render wishlist items using ProductCard component', () => {
    const mockContext = createMockContext({
      wishlist: [mockWishlistItem],
    });
    
    render(
      <AppContext.Provider value={mockContext}>
        <UserWishlist />
      </AppContext.Provider>
    );

    expect(screen.getByText('My Wishlist')).toBeInTheDocument();
    expect(screen.getByTestId('product-card-1')).toBeInTheDocument();
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByTestId('in-wishlist')).toBeInTheDocument();
  });

  it('should render multiple wishlist items', () => {
    const mockProduct2 = { ...mockProduct, id: 2, title: 'Second Product' };
    const mockWishlistItem2 = { ...mockWishlistItem, id: 2, productId: 2, product: mockProduct2 };
    
    const mockContext = createMockContext({
      wishlist: [mockWishlistItem, mockWishlistItem2 as any],
    });
    
    render(
      <AppContext.Provider value={mockContext}>
        <UserWishlist />
      </AppContext.Provider>
    );

    expect(screen.getByTestId('product-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('product-card-2')).toBeInTheDocument();
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('Second Product')).toBeInTheDocument();
  });
});
