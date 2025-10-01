import React from 'react';
import { render, screen } from '@testing-library/react';
import CategoryMenu from '@components/Layout/CategoryMenu';

jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    events: { on: jest.fn(), off: jest.fn() },
  }),
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

describe('CategoryMenu Button Styles', () => {
  test('Categories button has white background in light mode', () => {
    render(<CategoryMenu isSuperAdmin={false} pathname="/" />);
    const button = screen.getByLabelText('Categories menu');
    expect(button).toBeInTheDocument();
    expect(button.className).toContain('bg-white');
  });

  test('Categories button has dark background class for dark mode', () => {
    render(<CategoryMenu isSuperAdmin={false} pathname="/" />);
    const button = screen.getByLabelText('Categories menu');
    expect(button.className).toContain('dark:bg-gray-800');
  });

  test('Categories button has proper text colors', () => {
    render(<CategoryMenu isSuperAdmin={false} pathname="/" />);
    const button = screen.getByLabelText('Categories menu');
    expect(button.className).toContain('text-gray-900');
    expect(button.className).toContain('dark:text-gray-100');
  });

  test('Categories button has hover background styles', () => {
    render(<CategoryMenu isSuperAdmin={false} pathname="/" />);
    const button = screen.getByLabelText('Categories menu');
    expect(button.className).toContain('hover:bg-gray-100');
    expect(button.className).toContain('dark:hover:bg-gray-700');
  });

  test('Categories button has border styles', () => {
    render(<CategoryMenu isSuperAdmin={false} pathname="/" />);
    const button = screen.getByLabelText('Categories menu');
    expect(button.className).toContain('border');
    expect(button.className).toContain('border-gray-200');
    expect(button.className).toContain('dark:border-gray-700');
  });

  test('Categories button has proper padding and border-radius', () => {
    render(<CategoryMenu isSuperAdmin={false} pathname="/" />);
    const button = screen.getByLabelText('Categories menu');
    expect(button.className).toContain('px-4');
    expect(button.className).toContain('py-2');
    expect(button.className).toContain('rounded-lg');
  });

  test('Categories button has transition-colors', () => {
    render(<CategoryMenu isSuperAdmin={false} pathname="/" />);
    const button = screen.getByLabelText('Categories menu');
    expect(button.className).toContain('transition-colors');
  });

  test('does not render for super admin', () => {
    render(<CategoryMenu isSuperAdmin={true} pathname="/" />);
    const button = screen.queryByLabelText('Categories menu');
    expect(button).not.toBeInTheDocument();
  });
});
