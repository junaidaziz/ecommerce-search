import React from 'react';
import { render, screen, act } from '@testing-library/react';
// Update the import path below if your Header component is located elsewhere
import Header from '@components/Layout/Header';
import { USER_ROLES } from '@/types';
// Update the path below to the correct relative path where AppContext is defined
import { AppContext } from '@contexts/AppContext';

let mockPathname = '/';
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: mockPathname,
    events: { on: jest.fn(), off: jest.fn() },
  }),
}));

const mockUseSession = jest.fn();
jest.mock('next-auth/react', () => ({
  __esModule: true,
  useSession: (...args) => mockUseSession(...args),
  signOut: jest.fn(),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }) => <a href={href}>{children}</a>,
}));

beforeEach(() => {
  mockUseSession.mockReset();
  mockUseSession.mockReturnValue({ data: null });
  mockPathname = '/';
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});
const renderWithContext = (
  ui,
  { cart = [], wishlist = [], user = null } = {}
) => {
  const value = { cart, wishlist, user };
  return render(<AppContext.Provider value={value}>{ui}</AppContext.Provider>);
};

test.skip('shows login and signup when unauthenticated', () => {
  mockUseSession.mockReturnValue({ data: null });
  renderWithContext(<Header theme="light" setTheme={() => {}} />);
  expect(screen.getAllByText('Login').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Signup').length).toBeGreaterThan(0);
});

test.skip('shows name and cart count when authenticated', () => {
  const user = {
    role: USER_ROLES.SUPER_ADMIN,
    firstName: 'Alice',
    lastName: 'Smith',
    email: 'a@a.com',
  };
  const cart = [{ ID: 1, qty: 2 }];
  mockUseSession.mockReturnValue({ data: { user } });
  renderWithContext(<Header theme="light" setTheme={() => {}} />, { cart });
  expect(screen.getAllByText('Alice Smith').length).toBeGreaterThan(0);
  expect(screen.getAllByText('2').length).toBeGreaterThan(0);
});

test.skip('shows orders link when authenticated as customer', () => {
  const user = { role: 'customer', firstName: 'Bob', email: 'b@b.com' };
  mockUseSession.mockReturnValue({ data: { user } });
  renderWithContext(<Header theme="light" setTheme={() => {}} />);
  expect(screen.getAllByText('My Orders').length).toBeGreaterThan(0);
});

test.skip('renders categories from API', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([{ name: 'Electronics', subcategories: [{ name: 'Phones' }] }]),
    })
  );
  renderWithContext(<Header theme="light" setTheme={() => {}} />);
  // open the menu to render categories
  const button = screen.getAllByRole('button', { name: /categories/i })[0];
  await act(async () => {
    button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
  });
  expect(global.fetch).toHaveBeenCalled();
  global.fetch.mockRestore();
});

test.skip('shows fallback when no categories are available', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
  );
  renderWithContext(<Header theme="light" setTheme={() => {}} />);
  const button = screen.getAllByRole('button', { name: /categories/i })[0];
  button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
  expect(global.fetch).toHaveBeenCalled();
  global.fetch.mockRestore();
});

test.skip('hides search on auth pages', () => {
  mockPathname = '/login';
  renderWithContext(<Header theme="light" setTheme={() => {}} />);
  expect(screen.queryByPlaceholderText(/search for products/i)).toBeNull();
});

test.skip('shows brand navigation for brand role', () => {
  const sessionUser = { role: 'brand', firstName: 'Jane', email: 'j@b.com' };
  mockUseSession.mockReturnValue({ data: { user: sessionUser } });
  const contextUser = { role: 'brand', email: 'j@b.com' };
  renderWithContext(<Header theme="light" setTheme={() => {}} />, {
    user: contextUser,
  });
  expect(screen.queryByText('My Orders')).toBeNull();
  expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
});
