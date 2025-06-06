import React from 'react';
import { render, screen } from '@testing-library/react';
import Header from '../components/Header';
import { AppContext } from '../contexts/AppContext';

jest.mock('next/router', () => ({
  useRouter: () => ({ push: jest.fn() })
}));

jest.mock('next-auth/react', () => ({
  useSession: () => ({ data: null }),
  signOut: jest.fn()
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }) => <a href={href}>{children}</a>
}));

const renderWithContext = (ui, { cart = [], user = null } = {}) => {
  const value = { cart, user };
  return render(
    <AppContext.Provider value={value}>{ui}</AppContext.Provider>
  );
};

test('shows login and signup when unauthenticated', () => {
  renderWithContext(<Header />);
  expect(screen.getByText('Login')).toBeInTheDocument();
  expect(screen.getByText('Signup')).toBeInTheDocument();
});

test('shows admin and cart count when authenticated as admin', () => {
  const user = { role: 'admin', firstName: 'Alice', email: 'a@a.com' };
  const cart = [{ ID: 1, qty: 2 }];
  renderWithContext(<Header />, { user, cart });
  expect(screen.getByText('Admin')).toBeInTheDocument();
  expect(screen.getByText('2')).toBeInTheDocument();
});
