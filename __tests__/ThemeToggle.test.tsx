import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Layout from '@components/Layout/Layout';
import { ThemeProvider } from '@contexts/ThemeContext';
// Update the import path below if your AppContext is located elsewhere
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
  default: ({ href, children }) => <a href={href}>{children}</a>,
}));

const renderWithContext = (ui: React.ReactElement) => {
  const value = { cart: [] } as any;
  return render(
    <ThemeProvider>
      <AppContext.Provider value={value}>{ui}</AppContext.Provider>
    </ThemeProvider>
  );
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
    Promise.resolve(
      new Response(JSON.stringify([]), {
        status: 200,
        headers: { 'Content-type': 'application/json' },
      })
    )
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});

test.skip('toggle adds and removes dark class on html', () => {
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
