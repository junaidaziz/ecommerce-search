import React from 'react';
import { render, screen } from '@testing-library/react';
import { AppContext } from '../contexts/AppContext';
import BrandDashboard from '../pages/brand/dashboard';
import { User } from '../types';

// Mock the API fetch function
jest.mock('@lib/api', () => ({
  apiFetch: jest.fn(() => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ count: 5, products: [] })
  }))
}));

// Mock Next.js components
jest.mock('next/head', () => {
  return function Head({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  };
});

jest.mock('next/link', () => {
  return function Link({ href, children, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

// Mock dashboard components
jest.mock('@components/dashboard/ExistingProductsCard', () => {
  return function ExistingProductsCard() {
    return <div data-testid="existing-products-card">Existing Products</div>;
  };
});

jest.mock('@components/dashboard/TotalProductsCard', () => {
  return function TotalProductsCard() {
    return <div data-testid="total-products-card">Total Products</div>;
  };
});

jest.mock('@components/dashboard/TotalSalesCard', () => {
  return function TotalSalesCard() {
    return <div data-testid="total-sales-card">Total Sales</div>;
  };
});

jest.mock('@components/dashboard/OrdersThisMonthCard', () => {
  return function OrdersThisMonthCard() {
    return <div data-testid="orders-month-card">Orders This Month</div>;
  };
});

jest.mock('@components/dashboard/BestSellersCard', () => {
  return function BestSellersCard() {
    return <div data-testid="best-sellers-card">Best Sellers</div>;
  };
});

jest.mock('@components/dashboard/InventoryAlertsCard', () => {
  return function InventoryAlertsCard() {
    return <div data-testid="inventory-alerts-card">Inventory Alerts</div>;
  };
});

jest.mock('@components/dashboard/WeeklySummaryCard', () => {
  return function WeeklySummaryCard() {
    return <div data-testid="weekly-summary-card">Weekly Summary</div>;
  };
});

const mockAppContextValue = (user: User | null) => ({
  user,
  cart: [],
  wishlist: [],
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
});

describe('Brand Dashboard Access Control', () => {
  const originalEnv = process.env.AUTO_CONFIRM_BRANDS;

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.AUTO_CONFIRM_BRANDS = originalEnv;
    } else {
      delete process.env.AUTO_CONFIRM_BRANDS;
    }
  });

  test('shows login prompt when no user', () => {
    render(
      <AppContext.Provider value={mockAppContextValue(null)}>
        <BrandDashboard />
      </AppContext.Provider>
    );

    expect(screen.getByText('Please log in to manage products.')).toBeInTheDocument();
  });

  test('shows access denied for regular users', () => {
    const user = {
      id: 1,
      email: 'user@test.com',
      firstName: 'Regular',
      lastName: 'User',
      role: 'USER',
      verified: true,
    } as User;

    render(
      <AppContext.Provider value={mockAppContextValue(user)}>
        <BrandDashboard />
      </AppContext.Provider>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText('Brand access required.')).toBeInTheDocument();
  });

  test('allows access for verified brands', () => {
    const user = {
      id: 1,
      email: 'brand@test.com',
      firstName: 'Brand',
      lastName: 'User',
      brandName: 'Test Brand',
      role: 'BRAND',
      verified: true,
    } as User;

    render(
      <AppContext.Provider value={mockAppContextValue(user)}>
        <BrandDashboard />
      </AppContext.Provider>
    );

    expect(screen.getByText('Welcome back, Test Brand!')).toBeInTheDocument();
    expect(screen.getByTestId('total-products-card')).toBeInTheDocument();
  });

  test('allows access for super admin', () => {
    const user = {
      id: 1,
      email: 'admin@test.com',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      verified: true,
    } as User;

    render(
      <AppContext.Provider value={mockAppContextValue(user)}>
        <BrandDashboard />
      </AppContext.Provider>
    );

    expect(screen.getByText('Welcome back, Super!')).toBeInTheDocument();
    expect(screen.getByTestId('total-products-card')).toBeInTheDocument();
  });

  test('shows verification required for unverified brands when AUTO_CONFIRM_BRANDS is not true', () => {
    process.env.AUTO_CONFIRM_BRANDS = 'false';
    const user = {
      id: 1,
      email: 'brand@test.com',
      firstName: 'Brand',
      lastName: 'User',
      brandName: 'Test Brand',
      role: 'BRAND',
      verified: false,
    } as User;

    render(
      <AppContext.Provider value={mockAppContextValue(user)}>
        <BrandDashboard />
      </AppContext.Provider>
    );

    expect(screen.getByText('Account Verification Required')).toBeInTheDocument();
    expect(screen.getByText('Please check your email and click the verification link to activate your brand account.')).toBeInTheDocument();
  });

  test('allows access for unverified brands when AUTO_CONFIRM_BRANDS is true (local env)', () => {
    process.env.AUTO_CONFIRM_BRANDS = 'true';
    const user = {
      id: 1,
      email: 'brand@test.com',
      firstName: 'Brand',
      lastName: 'User',
      brandName: 'Test Brand',
      role: 'BRAND',
      verified: false,
    } as User;

    render(
      <AppContext.Provider value={mockAppContextValue(user)}>
        <BrandDashboard />
      </AppContext.Provider>
    );

    expect(screen.getByText('Welcome back, Test Brand!')).toBeInTheDocument();
    expect(screen.getByTestId('total-products-card')).toBeInTheDocument();
  });

  test('shows verification required for unverified brands when AUTO_CONFIRM_BRANDS is undefined', () => {
    delete process.env.AUTO_CONFIRM_BRANDS;
    const user = {
      id: 1,
      email: 'brand@test.com',
      firstName: 'Brand',
      lastName: 'User',
      brandName: 'Test Brand',
      role: 'BRAND',
      verified: false,
    } as User;

    render(
      <AppContext.Provider value={mockAppContextValue(user)}>
        <BrandDashboard />
      </AppContext.Provider>
    );

    expect(screen.getByText('Account Verification Required')).toBeInTheDocument();
    expect(screen.getByText('Please check your email and click the verification link to activate your brand account.')).toBeInTheDocument();
  });
});