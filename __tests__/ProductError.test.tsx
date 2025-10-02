import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductError from '@components/Product/ProductError';
import { useRouter } from 'next/router';

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('ProductError', () => {
  const mockBack = jest.fn();
  const mockPush = jest.fn();

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      back: mockBack,
      push: mockPush,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('404 Not Found Error', () => {
    it('renders not found error with default message', () => {
      render(<ProductError type="not-found" />);
      
      expect(screen.getByText('Product Not Found')).toBeInTheDocument();
      expect(screen.getByText('The product you are looking for could not be found.')).toBeInTheDocument();
    });

    it('renders not found error with custom message', () => {
      const customMessage = 'This product has been discontinued';
      render(<ProductError type="not-found" message={customMessage} />);
      
      expect(screen.getByText('Product Not Found')).toBeInTheDocument();
      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });

    it('does not show additional help section for 404 errors', () => {
      render(<ProductError type="not-found" />);
      
      expect(screen.queryByText(/If this problem persists/i)).not.toBeInTheDocument();
    });
  });

  describe('API Error', () => {
    it('renders API error with default message', () => {
      render(<ProductError type="api-error" />);
      
      expect(screen.getByText('Error Loading Product')).toBeInTheDocument();
      expect(screen.getByText('We encountered an error loading this product. Please try again later.')).toBeInTheDocument();
    });

    it('renders API error with custom message', () => {
      const customMessage = 'Database connection failed';
      render(<ProductError type="api-error" message={customMessage} />);
      
      expect(screen.getByText('Error Loading Product')).toBeInTheDocument();
      expect(screen.getByText(customMessage)).toBeInTheDocument();
    });

    it('shows additional help section for API errors', () => {
      render(<ProductError type="api-error" />);
      
      expect(screen.getByText(/If this problem persists/i)).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('renders both action buttons by default', () => {
      render(<ProductError type="not-found" />);
      
      expect(screen.getByText('Go Back')).toBeInTheDocument();
      expect(screen.getByText('Browse Products')).toBeInTheDocument();
    });

    it('hides back button when showBackButton is false', () => {
      render(<ProductError type="not-found" showBackButton={false} />);
      
      expect(screen.queryByText('Go Back')).not.toBeInTheDocument();
      expect(screen.getByText('Browse Products')).toBeInTheDocument();
    });

    it('calls router.back() when Go Back button is clicked', () => {
      render(<ProductError type="not-found" />);
      
      const backButton = screen.getByText('Go Back');
      fireEvent.click(backButton);
      
      expect(mockBack).toHaveBeenCalledTimes(1);
    });

    it('Browse Products link has correct href', () => {
      render(<ProductError type="not-found" />);
      
      const browseLink = screen.getByText('Browse Products').closest('a');
      expect(browseLink).toHaveAttribute('href', '/products');
    });
  });

  describe('Accessibility', () => {
    it('has appropriate ARIA attributes on icons', () => {
      const { container } = render(<ProductError type="not-found" />);
      
      const icon = container.querySelector('svg');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
