import React from 'react';
import { render, screen } from '@testing-library/react';
import FormError from '@components/Auth/FormError';

describe('FormError', () => {
  it('renders error message when provided', () => {
    render(<FormError message="Invalid credentials" />);
    
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('does not render when message is empty', () => {
    const { container } = render(<FormError message="" />);
    
    expect(container.firstChild).toBeNull();
  });

  it('applies correct styling classes', () => {
    const { container } = render(<FormError message="Test error" />);
    const alert = container.querySelector('[role="alert"]');
    
    expect(alert).toHaveClass('mb-4');
    expect(alert).toHaveClass('p-3');
    expect(alert).toHaveClass('rounded-lg');
    expect(alert).toHaveClass('text-left');
  });

  it('includes error icon', () => {
    const { container } = render(<FormError message="Test error" />);
    const icon = container.querySelector('svg');
    
    expect(icon).toBeInTheDocument();
  });
});
