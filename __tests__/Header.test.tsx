import React from 'react';
import { render, screen, act } from '@testing-library/react';
import Header from '../components/Header';
import { AppContext } from '../contexts/AppContext';

let mockPathname = '/';
jest.mock('next/router', () => ({
  useRouter: () => ({ push: jest.fn(), pathname: mockPathname }),
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

test('shows login and signup when unauthenticated', () => {
  mockUseSession.mockReturnValue({ data: null });
  renderWithContext(<Header theme="light" setTheme={() => {}} />);
  expect(screen.getAllByText('Login').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Signup').length).toBeGreaterThan(0);
});

test('shows name and cart count when authenticated', () => {
  const user = {
    role: 'super-admin',
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


test('hides search on auth pages', () => {
  mockPathname = '/login';
  renderWithContext(<Header theme="light" setTheme={() => {}} />);
  expect(screen.queryByPlaceholderText(/search/i)).toBeNull();
});
