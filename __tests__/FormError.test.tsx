import React from 'react';
import { render, screen } from '@testing-library/react';
import FormError from '@components/Auth/FormError';

describe('FormError Component', () => {
  it('should render error message when provided', () => {
    const errorMessage = 'This is an error message';
    render(<FormError message={errorMessage} />);
    
    const errorElement = screen.getByRole('alert');
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveTextContent(errorMessage);
  });

  it('should not render when message is empty', () => {
    const { container } = render(<FormError message="" />);
    expect(container.firstChild).toBeNull();
  });

  it('should not render when message is undefined', () => {
    const { container } = render(<FormError />);
    expect(container.firstChild).toBeNull();
  });

  it('should apply correct alignment classes', () => {
    const { rerender } = render(<FormError message="Error" align="left" />);
    expect(screen.getByRole('alert')).toHaveClass('text-left');

    rerender(<FormError message="Error" align="center" />);
    expect(screen.getByRole('alert')).toHaveClass('text-center');

    rerender(<FormError message="Error" align="right" />);
    expect(screen.getByRole('alert')).toHaveClass('text-right');
  });

  it('should apply custom className', () => {
    render(<FormError message="Error" className="custom-class" />);
    expect(screen.getByRole('alert')).toHaveClass('custom-class');
  });

  it('should have aria-live attribute for accessibility', () => {
    render(<FormError message="Error" />);
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
  });

  it('should have default left alignment', () => {
    render(<FormError message="Error" />);
    expect(screen.getByRole('alert')).toHaveClass('text-left');
  });
});
