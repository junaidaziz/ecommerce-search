import React from 'react';
import { render, screen } from '@testing-library/react';
import UserHeader from '@components/Layout/UserHeader';
import { AppContext } from '@contexts/AppContext';

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    events: { on: jest.fn(), off: jest.fn() },
  }),
}));

jest.mock('next-auth/react', () => ({
  __esModule: true,
  useSession: () => ({ data: null }),
  signOut: jest.fn(),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: any) => <a href={href}>{children}</a>,
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
  const value = { cart: [], wishlist: [], changeQty: jest.fn(), removeFromCart: jest.fn() } as any;
  return render(<AppContext.Provider value={value}>{ui}</AppContext.Provider>);
};

test('UserHeader renders with light theme classes', () => {
  const { container } = renderWithContext(
    <UserHeader theme="light" setTheme={() => {}} />
  );
  const header = container.querySelector('header');
  expect(header).toBeInTheDocument();
  expect(header?.className).toContain('bg-white/95');
  expect(header?.className).toContain('dark:bg-gray-950/95');
});

test('UserHeader has theme-aware border classes', () => {
  const { container } = renderWithContext(
    <UserHeader theme="light" setTheme={() => {}} />
  );
  const header = container.querySelector('header');
  expect(header?.className).toContain('border-gray-200');
  expect(header?.className).toContain('dark:border-gray-800');
});

test('theme toggle button is present', () => {
  renderWithContext(<UserHeader theme="light" setTheme={() => {}} />);
  const button = screen.getByLabelText('Toggle dark mode');
  expect(button).toBeInTheDocument();
});
