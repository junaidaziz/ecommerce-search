import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmationPage from '@components/pages/ConfirmationPage';

describe('ConfirmationPage', () => {
  it('renders verifying state correctly', () => {
    render(<ConfirmationPage status="verifying" />);
    
    expect(screen.getByText('Verifying...')).toBeInTheDocument();
    expect(screen.getByText('Please wait while we verify your email.')).toBeInTheDocument();
  });

  it('renders success state correctly', () => {
    render(<ConfirmationPage status="success" />);
    
    expect(screen.getByText('Email Verified!')).toBeInTheDocument();
    expect(screen.getByText(/Your email has been successfully verified/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue to Login/i })).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    render(<ConfirmationPage status="error" />);
    
    expect(screen.getByText('Verification Failed')).toBeInTheDocument();
    expect(screen.getByText(/The verification link is invalid or has expired/)).toBeInTheDocument();
  });

  it('renders custom error message', () => {
    const customError = 'Custom error message';
    render(<ConfirmationPage status="error" errorMessage={customError} />);
    
    expect(screen.getByText(customError)).toBeInTheDocument();
  });

  it('renders resend button when onResend is provided', () => {
    const mockResend = jest.fn();
    render(<ConfirmationPage status="error" onResend={mockResend} />);
    
    const resendButton = screen.getByRole('button', { name: /Resend Verification Email/i });
    expect(resendButton).toBeInTheDocument();
    
    fireEvent.click(resendButton);
    expect(mockResend).toHaveBeenCalledTimes(1);
  });

  it('disables resend button when resending', () => {
    const mockResend = jest.fn();
    render(<ConfirmationPage status="error" onResend={mockResend} resending={true} />);
    
    const resendButton = screen.getByRole('button', { name: /Sending.../i });
    expect(resendButton).toBeDisabled();
  });

  it('does not render resend button when onResend is not provided', () => {
    render(<ConfirmationPage status="error" />);
    
    expect(screen.queryByRole('button', { name: /Resend Verification Email/i })).not.toBeInTheDocument();
  });

  it('shows return to login link in error state', () => {
    const mockResend = jest.fn();
    render(<ConfirmationPage status="error" onResend={mockResend} />);
    
    const loginLink = screen.getByText('return to login');
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });
});
