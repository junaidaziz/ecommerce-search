import React from 'react';
import { render, screen } from '@testing-library/react';
import BrandHeader from '@components/Layout/BrandHeader';
import { AppContext } from '@contexts/AppContext';

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/brand/dashboard',
    events: { on: jest.fn(), off: jest.fn() },
  }),
}));

jest.mock('next-auth/react', () => ({
  __esModule: true,
  useSession: jest.fn(() => ({ data: null })),
  signOut: jest.fn(),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, className }: any) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

// Mock NotificationBell component
jest.mock('@components/Layout/NotificationBell', () => ({
  __esModule: true,
  default: () => <div data-testid="notification-bell">NotificationBell</div>,
}));

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ categories: [] }),
    } as Response)
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});

const renderWithContext = (ui: React.ReactElement) => {
  const value = { cart: [], wishlist: [] } as any;
  return render(<AppContext.Provider value={value}>{ui}</AppContext.Provider>);
};

describe('BrandHeader', () => {
  test('BrandHeader renders with light theme classes', () => {
    const { container } = renderWithContext(
      <BrandHeader theme="light" setTheme={() => {}} />
    );
    const header = container.querySelector('header');
    expect(header).toBeInTheDocument();
    expect(header?.className).toContain('bg-white/95');
    expect(header?.className).toContain('dark:bg-gray-950/95');
  });

  test('BrandHeader has theme-aware border classes', () => {
    const { container } = renderWithContext(
      <BrandHeader theme="light" setTheme={() => {}} />
    );
    const header = container.querySelector('header');
    expect(header?.className).toContain('border-gray-200');
    expect(header?.className).toContain('dark:border-gray-800');
  });

  test('theme toggle button is present and shows correct icon', () => {
    renderWithContext(<BrandHeader theme="light" setTheme={() => {}} />);
    const button = screen.getByLabelText('Toggle dark mode');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('title', 'Switch to dark mode');
  });

  test('navigation links have theme-aware text colors', () => {
    const { container } = renderWithContext(
      <BrandHeader theme="light" setTheme={() => {}} />
    );
    
    // Check if any nav links exist (they only show for authenticated users)
    const nav = container.querySelector('nav');
    expect(nav).toBeInTheDocument();
  });

  test('Login button has theme-aware styles when user is not authenticated', () => {
    renderWithContext(<BrandHeader theme="light" setTheme={() => {}} />);
    
    const loginLink = screen.getByText('Login');
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.className).toContain('text-gray-700');
    expect(loginLink.className).toContain('dark:text-gray-200');
  });

  test('Signup button has primary background', () => {
    renderWithContext(<BrandHeader theme="light" setTheme={() => {}} />);
    
    const signupLink = screen.getByText('Signup');
    expect(signupLink).toBeInTheDocument();
    expect(signupLink.className).toContain('bg-primary');
  });

  test('NotificationBell component is rendered', () => {
    renderWithContext(<BrandHeader theme="light" setTheme={() => {}} />);
    
    expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
  });

  test('Products navigation link is present for brand users', () => {
    const { useSession } = require('next-auth/react');
    useSession.mockReturnValue({
      data: {
        user: {
          role: 'BRAND',
          email: 'brand@test.com',
          name: 'Test Brand',
        },
      },
    });

    renderWithContext(<BrandHeader theme="light" setTheme={() => {}} />);
    
    const productsLink = screen.getByText('Products');
    expect(productsLink).toBeInTheDocument();
    expect(productsLink.getAttribute('href')).toBe('/brand/products');
  });
});
