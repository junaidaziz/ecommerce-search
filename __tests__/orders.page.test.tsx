import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import Orders from '@pages/orders';
import { AppContext } from '@contexts/AppContext';
import { NotificationContext } from '@contexts/NotificationContext';

jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { email: 'test@example.com' } },
    status: 'authenticated',
  }),
}));

jest.mock('next/router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

jest.mock('@components/Chat/OrderChatWindow', () => ({
  __esModule: true,
  default: () => <div>Order Chat Window</div>,
}));

const mockAddNotification = jest.fn();

const renderWithContext = () => {
  const appValue: any = { user: { email: 'test@example.com', role: 'USER' } };
  const notificationValue: any = { 
    addNotification: mockAddNotification,
    notifications: [],
    removeNotification: jest.fn(),
  };
  
  return render(
    <AppContext.Provider value={appValue}>
      <NotificationContext.Provider value={notificationValue}>
        <Orders />
      </NotificationContext.Provider>
    </AppContext.Provider>
  );
};

describe('Orders page', () => {
  beforeEach(() => {
    (global.fetch as any) = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders page title and filters', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
    
    renderWithContext();
    
    expect(screen.getByText('My Orders')).toBeInTheDocument();
    expect(screen.getByText('View and manage your order history')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search by order # or product name...')).toBeInTheDocument();
  });

  it('displays orders when loaded', async () => {
    const mockOrders = [
      {
        id: 1,
        uuid: 'order-1',
        status: 'processing',
        total: 99.99,
        quantity: 1,
        createdAt: new Date().toISOString(),
        paymentReference: 'ref-1',
        product: {
          id: 1,
          title: 'Test Product',
          vendor: { brandName: 'Test Brand', logo: null },
          featuredImage: null,
        },
        user: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        },
      },
    ];

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockOrders),
    });
    
    renderWithContext();
    
    expect(await screen.findByText('#1')).toBeInTheDocument();
  });

  it('shows error when fetch fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: 'Failed to load' }),
    });
    
    renderWithContext();
    
    expect(await screen.findByText(/Failed to load/)).toBeInTheDocument();
  });

  it('shows no orders message when empty', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
    
    renderWithContext();
    
    // Wait for the "No orders found" message
    const noOrdersMessage = await screen.findByText('No orders found.', {}, { timeout: 5000 });
    expect(noOrdersMessage).toBeInTheDocument();
  });
});
