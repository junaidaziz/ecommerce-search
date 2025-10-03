import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NotificationBell from '@components/Layout/NotificationBell';

// Mock the apiFetch function - must return a function
jest.mock('@lib/api', () => ({
  apiFetch: jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response)
  ),
}));

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    pathname: '/test',
    query: {},
    asPath: '/test',
  })),
}));

// Mock BellIcon
jest.mock('@components/icons/BellIcon', () => ({
  __esModule: true,
  default: ({ className }: { className?: string }) => (
    <svg data-testid="bell-icon" className={className}>
      <path />
    </svg>
  ),
}));

describe('NotificationBell', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders notification bell button', () => {
    render(<NotificationBell />);
    const button = screen.getByRole('button', { name: /notifications/i });
    expect(button).toBeInTheDocument();
  });

  test('dropdown is hidden by default', () => {
    render(<NotificationBell />);
    // Check that the dropdown menu is not visible initially
    const notificationsText = screen.queryByText('Notifications');
    expect(notificationsText).not.toBeInTheDocument();
  });

  test('dropdown appears when bell icon is clicked', () => {
    render(<NotificationBell />);
    const button = screen.getByRole('button', { name: /notifications/i });
    
    // Click the button
    fireEvent.click(button);
    
    // Check that the dropdown is now visible
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  test('shows "No notifications" when items list is empty', () => {
    render(<NotificationBell notifications={[]} />);
    
    // Open dropdown
    const button = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(button);
    
    // Check for "No notifications" message inside dropdown
    expect(screen.getByText('No notifications')).toBeInTheDocument();
  });

  test('displays notification count badge when unread notifications exist', () => {
    const notifications = [
      { id: 1, message: 'Test notification 1', read: false, createdAt: new Date() },
      { id: 2, message: 'Test notification 2', read: false, createdAt: new Date() },
    ];
    
    render(<NotificationBell notifications={notifications} />);
    
    // Check for badge with count
    const badge = screen.getByText('2');
    expect(badge).toBeInTheDocument();
  });

  test('does not show badge when all notifications are read', () => {
    const notifications = [
      { id: 1, message: 'Test notification 1', read: true, createdAt: new Date() },
      { id: 2, message: 'Test notification 2', read: true, createdAt: new Date() },
    ];
    
    render(<NotificationBell notifications={notifications} />);
    
    // Check that badge is not shown
    const badge = screen.queryByText('2');
    expect(badge).not.toBeInTheDocument();
  });

  test('toggle closes dropdown when already open', () => {
    render(<NotificationBell />);
    const button = screen.getByRole('button', { name: /notifications/i });
    
    // Open dropdown
    fireEvent.click(button);
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    
    // Close dropdown
    fireEvent.click(button);
    expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
  });

  test('does not cause infinite re-renders with default notifications prop', () => {
    // This test verifies the fix for the infinite re-render issue
    // If the component has an infinite loop, this test will timeout/fail
    const { rerender } = render(<NotificationBell />);
    
    // Force a re-render with a new default array (simulating parent re-render)
    rerender(<NotificationBell notifications={[]} />);
    
    // If we got here without errors, the infinite loop is fixed
    const button = screen.getByRole('button', { name: /notifications/i });
    expect(button).toBeInTheDocument();
  });

  test('initializes with provided notifications but manages its own state', () => {
    const initialNotifications = [
      { id: 1, message: 'Initial notification', read: false, createdAt: new Date() },
    ];
    
    const { rerender } = render(<NotificationBell notifications={initialNotifications} />);
    
    // Open dropdown to see initial notification
    const button = screen.getByRole('button', { name: /notifications/i });
    fireEvent.click(button);
    expect(screen.getByText('Initial notification')).toBeInTheDocument();
    
    // Re-render with different notifications prop
    // The component should NOT update its internal state from this prop change
    const newNotifications = [
      { id: 2, message: 'New notification', read: false, createdAt: new Date() },
    ];
    rerender(<NotificationBell notifications={newNotifications} />);
    
    // Should still show the initial notification, not the new one
    // because the component manages its own state after initialization
    expect(screen.getByText('Initial notification')).toBeInTheDocument();
    expect(screen.queryByText('New notification')).not.toBeInTheDocument();
  });
});
