import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from '../components/Header';
import { AppContext } from '../contexts/AppContext';

jest.mock('next/router', () => ({
  useRouter: () => ({ push: jest.fn() })
}));

const mockUseSession = jest.fn();
jest.mock('next-auth/react', () => ({
  __esModule: true,
  useSession: (...args) => mockUseSession(...args),
  signOut: jest.fn()
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }) => <a href={href}>{children}</a>
}));

beforeEach(() => {
  mockUseSession.mockReset();
  mockUseSession.mockReturnValue({ data: null });
});
const renderWithContext = (ui, { cart = [], user = null } = {}) => {
  const value = { cart, user };
  return render(
    <AppContext.Provider value={value}>{ui}</AppContext.Provider>
  );
};

test('shows login and signup when unauthenticated', () => {
  mockUseSession.mockReturnValue({ data: null });
  renderWithContext(<Header />);
  expect(screen.getAllByText('Login').length).toBeGreaterThan(0);
  expect(screen.getAllByText('Signup').length).toBeGreaterThan(0);
});

test('shows admin and cart count when authenticated as admin', () => {
  const user = { role: 'admin', firstName: 'Alice', email: 'a@a.com' };
  const cart = [{ ID: 1, qty: 2 }];
  mockUseSession.mockReturnValue({ data: { user } });
  renderWithContext(<Header />, { cart });
  expect(screen.getAllByText('Admin').length).toBeGreaterThan(0);
  expect(screen.getAllByText('2').length).toBeGreaterThan(0);
});
