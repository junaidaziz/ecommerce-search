import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Layout from '../components/Layout';
import { AppContext } from '../contexts/AppContext';

jest.mock('next/router', () => ({
  useRouter: () => ({ push: jest.fn(), pathname: '/' }),
}));

jest.mock('next-auth/react', () => ({
  __esModule: true,
  useSession: () => ({ data: null }),
  signOut: jest.fn(),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }) => <a href={href}>{children}</a>,
}));

const renderWithContext = (ui: React.ReactElement) => {
  const value = { cart: [] } as any;
  return render(<AppContext.Provider value={value}>{ui}</AppContext.Provider>);
};

beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
    })),
  });
  localStorage.clear();
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('toggle adds and removes dark class on html', () => {
  renderWithContext(
    <Layout>
      <div>Content</div>
    </Layout>
  );
  const [checkbox] = screen.getAllByRole('checkbox', {
    name: /toggle dark mode/i,
  });
  expect(document.documentElement.classList.contains('dark')).toBe(false);
  fireEvent.click(checkbox);
  expect(document.documentElement.classList.contains('dark')).toBe(true);
  expect(localStorage.getItem('theme')).toBe('dark');
  fireEvent.click(checkbox);
  expect(document.documentElement.classList.contains('dark')).toBe(false);
  expect(localStorage.getItem('theme')).toBe('light');
});
