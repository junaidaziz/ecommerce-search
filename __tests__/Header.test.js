import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from '../components/Header';
import { AppContext } from '../contexts/AppContext';

jest.mock('next/router', () => ({
  useRouter: () => ({ push: jest.fn() }),
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

test('shows login and signup when unauthenticated', () => {
  mockUseSession.mockReturnValue({ data: null });
  renderWithContext(<Header />);
  expect(screen.getAllByText('Login').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Signup').length).toBeGreaterThan(0);
});

test('shows admin and cart count when authenticated as admin', () => {
  const user = { role: 'super-admin', firstName: 'Alice', email: 'a@a.com' };
  const cart = [{ ID: 1, qty: 2 }];
  mockUseSession.mockReturnValue({ data: { user } });
  renderWithContext(<Header />, { cart });
  expect(screen.getAllByText('Admin').length).toBeGreaterThan(0);
  expect(screen.getAllByText('2').length).toBeGreaterThan(0);
});

test('shows orders link when authenticated as customer', () => {
  const user = { role: 'customer', firstName: 'Bob', email: 'b@b.com' };
  mockUseSession.mockReturnValue({ data: { user } });
  renderWithContext(<Header />);
  expect(screen.getAllByText('Orders').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Wishlist').length).toBeGreaterThan(0);
});

test('renders categories from API', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([{ name: 'Electronics', subcategories: ['Phones'] }]),
    })
  );
  renderWithContext(<Header />);
  // open the menu to render categories
  const button = screen.getByRole('button', { name: /categories/i });
  button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
  expect(await screen.findByText('Electronics')).toBeInTheDocument();
  global.fetch.mockRestore();
});

test('shows fallback when no categories are available', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
  );
  renderWithContext(<Header />);
  const button = screen.getByRole('button', { name: /categories/i });
  button.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
  expect(await screen.findByText('No categories found')).toBeInTheDocument();
  global.fetch.mockRestore();
});
