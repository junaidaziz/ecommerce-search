import React from 'react';
import { render, screen } from '@testing-library/react';
import AuthMessage from '@components/Auth/AuthMessage';

describe('AuthMessage Component', () => {
  it('should render info message when provided', () => {
    const message = 'This is an info message';
    render(<AuthMessage message={message} type="info" />);
    
    const messageElement = screen.getByRole('alert');
    expect(messageElement).toBeInTheDocument();
    expect(messageElement).toHaveTextContent(message);
  });

  it('should not render when message is empty', () => {
    const { container } = render(<AuthMessage message="" />);
    expect(container.firstChild).toBeNull();
  });

  it('should apply correct type classes', () => {
    const message = 'Test message';
    const { rerender } = render(<AuthMessage message={message} type="info" />);
    let messageElement = screen.getByRole('alert');
    expect(messageElement).toHaveClass('text-gray-500');
    expect(messageElement).toHaveClass('bg-gray-50');

    rerender(<AuthMessage message={message} type="success" />);
    messageElement = screen.getByRole('alert');
    expect(messageElement).toHaveClass('text-green-600');
    expect(messageElement).toHaveClass('bg-green-50');

    rerender(<AuthMessage message={message} type="warning" />);
    messageElement = screen.getByRole('alert');
    expect(messageElement).toHaveClass('text-yellow-600');
    expect(messageElement).toHaveClass('bg-yellow-50');

    rerender(<AuthMessage message={message} type="error" />);
    messageElement = screen.getByRole('alert');
    expect(messageElement).toHaveClass('text-red-600');
    expect(messageElement).toHaveClass('bg-red-50');
  });

  it('should apply correct alignment classes', () => {
    const { rerender } = render(<AuthMessage message="Test" align="left" />);
    expect(screen.getByRole('alert')).toHaveClass('text-left');

    rerender(<AuthMessage message="Test" align="center" />);
    expect(screen.getByRole('alert')).toHaveClass('text-center');

    rerender(<AuthMessage message="Test" align="right" />);
    expect(screen.getByRole('alert')).toHaveClass('text-right');
  });

  it('should apply custom className', () => {
    render(<AuthMessage message="Test" className="custom-class" />);
    expect(screen.getByRole('alert')).toHaveClass('custom-class');
  });

  it('should have aria-live attribute for accessibility', () => {
    render(<AuthMessage message="Test" />);
    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite');
  });

  it('should have default info type', () => {
    render(<AuthMessage message="Test" />);
    expect(screen.getByRole('alert')).toHaveClass('text-gray-500');
  });

  it('should have default left alignment', () => {
    render(<AuthMessage message="Test" />);
    expect(screen.getByRole('alert')).toHaveClass('text-left');
  });
});
