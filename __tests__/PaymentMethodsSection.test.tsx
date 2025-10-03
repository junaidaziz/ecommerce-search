import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PaymentMethodsSection from '@components/Settings/PaymentMethodsSection';
import { apiFetch } from '@lib/api';

// Mock the apiFetch function
jest.mock('@lib/api', () => ({
  apiFetch: jest.fn(),
}));

// Mock the react-icons
jest.mock('react-icons/fa', () => ({
  FaPaypal: () => <div data-testid="paypal-icon">PayPal</div>,
}));

const mockApiResponse = (data: any) => {
  (apiFetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => data,
  });
};

describe('PaymentMethodsSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders payment methods section with card and PayPal tabs', async () => {
    mockApiResponse([]);
    render(<PaymentMethodsSection />);
    
    await waitFor(() => {
      expect(screen.getByText(/Payment Methods/i)).toBeInTheDocument();
      expect(screen.getByText(/Credit\/Debit Card/i)).toBeInTheDocument();
      expect(screen.getByText(/PayPal/i)).toBeInTheDocument();
    });
  });

  test('displays existing payment methods', async () => {
    const mockMethods = [
      {
        id: 1,
        provider: 'card',
        cardLast4: '4242',
        cardBrand: 'visa',
        expMonth: 12,
        expYear: 2025,
        isDefault: true,
      },
      {
        id: 2,
        provider: 'paypal',
        paypalEmail: 'test@example.com',
        isDefault: false,
      },
    ];
    
    mockApiResponse(mockMethods);
    render(<PaymentMethodsSection />);
    
    await waitFor(() => {
      expect(screen.getByText(/visa \*\*\*\*4242/i)).toBeInTheDocument();
      expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
      expect(screen.getByText(/Default/i)).toBeInTheDocument();
    });
  });

  test('shows empty state when no payment methods exist', async () => {
    mockApiResponse([]);
    render(<PaymentMethodsSection />);
    
    await waitFor(() => {
      expect(screen.getByText(/No payment methods added yet/i)).toBeInTheDocument();
    });
  });

  test('switches between card and PayPal forms', async () => {
    mockApiResponse([]);
    render(<PaymentMethodsSection />);
    
    await waitFor(() => {
      const cardTab = screen.getByText(/Credit\/Debit Card/i);
      const paypalTab = screen.getByText(/PayPal/i);
      
      // Card form should be visible initially
      expect(screen.getByPlaceholderText(/MM/i)).toBeInTheDocument();
      
      // Click PayPal tab
      fireEvent.click(paypalTab);
      
      // PayPal form should be visible
      expect(screen.getByPlaceholderText(/your\.email@example\.com/i)).toBeInTheDocument();
      
      // Card form should not be visible
      expect(screen.queryByPlaceholderText(/MM/i)).not.toBeInTheDocument();
      
      // Click card tab
      fireEvent.click(cardTab);
      
      // Card form should be visible again
      expect(screen.getByPlaceholderText(/MM/i)).toBeInTheDocument();
    });
  });

  test('validates PayPal email', async () => {
    mockApiResponse([]);
    render(<PaymentMethodsSection />);
    
    await waitFor(() => {
      const paypalTab = screen.getByText(/PayPal/i);
      fireEvent.click(paypalTab);
      
      const emailInput = screen.getByPlaceholderText(/your\.email@example\.com/i);
      
      // Invalid email
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      expect(screen.getByText(/Invalid email address/i)).toBeInTheDocument();
      
      // Valid email
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      expect(screen.queryByText(/Invalid email address/i)).not.toBeInTheDocument();
    });
  });

  test('disables submit button when form is invalid', async () => {
    mockApiResponse([]);
    render(<PaymentMethodsSection />);
    
    await waitFor(() => {
      const submitButton = screen.getByText(/Add Payment Method/i);
      expect(submitButton).toBeDisabled();
    });
  });
});
