import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ExistingProductsCard from '@components/dashboard/ExistingProductsCard';

jest.mock('next/router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

const mockProducts = [
  { id: 1, title: 'Old', createdAt: '2024-01-01' },
  { id: 2, title: 'New', createdAt: '2024-02-01' },
] as any;

const renderCard = async (fetchImpl: any) => {
  global.fetch = jest.fn(fetchImpl) as jest.Mock;
  render(<ExistingProductsCard previewCount={1} />);
  await waitFor(() => expect(global.fetch).toHaveBeenCalled());
};

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders preview list when products available', async () => {
  await renderCard(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ products: mockProducts, total: 2 }),
    })
  );
  await screen.findByText(/You currently have 2 product/);
  expect(screen.getByRole('list')).toHaveTextContent('New');
});

test('handles undefined products gracefully', async () => {
  await renderCard(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    })
  );
  expect(screen.queryByRole('list')).toBeNull();
});
