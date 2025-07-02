import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import OrderDetail from '@pages/orders/[orderId]';
import { AppContext } from '@contexts/AppContext';

jest.mock('next/router', () => ({
  useRouter: () => ({ query: { orderId: 'abc' } }),
}));

const renderWithUser = (userRole: string) => {
  const value: any = { user: { role: userRole } };
  return render(
    <AppContext.Provider value={value}>
      <OrderDetail />
    </AppContext.Provider>
  );
};

describe('OrderDetail page', () => {
  beforeEach(() => {
    (global.fetch as any) = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('shows order details for valid ID', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 1,
          uuid: 'abc',
          status: 'processing',
          product: { title: 'Test', vendor: { brandName: 'Brand', logo: null } },
          quantity: 2,
          total: 20,
        }),
    });
    renderWithUser('user');
    expect(global.fetch).toHaveBeenCalledWith('/api/user/orders/abc');
    expect(await screen.findByText('Order #1')).toBeInTheDocument();
  });

  it('shows not found for invalid ID', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ message: 'Not found' }),
    });
    renderWithUser('brand');
    expect(global.fetch).toHaveBeenCalledWith('/api/orders/abc');
    expect(await screen.findByText('Order not found.')).toBeInTheDocument();
  });

  it('shows error on network failure', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network'));
    renderWithUser('brand');
    expect(global.fetch).toHaveBeenCalledWith('/api/orders/abc');
    expect(await screen.findByText('Failed to load order')).toBeInTheDocument();
  });
});
