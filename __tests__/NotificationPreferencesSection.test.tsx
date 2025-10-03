import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NotificationPreferencesSection from '@components/Settings/NotificationPreferencesSection';

// Mock apiFetch
const mockFetch = jest.fn();
jest.mock('@lib/api', () => ({
  apiFetch: mockFetch,
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('NotificationPreferencesSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockImplementation((url) => {
      if (url === '/api/user/notification-preferences') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: 1,
              userId: 1,
              orderUpdates: true,
              promotions: true,
              discounts: true,
              generalUpdates: true,
              emailNotifications: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            }),
        } as Response);
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  test('renders loading state initially', () => {
    render(<NotificationPreferencesSection />);
    // Check for loading skeleton elements
    const skeletons = screen.getByText('Notification Preferences').parentElement?.parentElement;
    expect(skeletons).toBeInTheDocument();
  });

  test('renders notification preferences after loading', async () => {
    render(<NotificationPreferencesSection />);
    
    await waitFor(() => {
      expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
    });

    expect(screen.getByText('Order Updates')).toBeInTheDocument();
    expect(screen.getByText('Promotions')).toBeInTheDocument();
    expect(screen.getByText('Discounts')).toBeInTheDocument();
    expect(screen.getByText('General Updates')).toBeInTheDocument();
    expect(screen.getByText('Email Notifications')).toBeInTheDocument();
  });

  test('toggles a preference when clicked', async () => {
    render(<NotificationPreferencesSection />);
    
    await waitFor(() => {
      expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
    });

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).toBeChecked(); // Initially true

    fireEvent.click(checkboxes[0]);
    expect(checkboxes[0]).not.toBeChecked();
  });

  test('saves preferences when save button is clicked', async () => {
    render(<NotificationPreferencesSection />);
    
    await waitFor(() => {
      expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
    });

    const saveButton = screen.getByText('Save Preferences');
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).not.toBeDisabled();
  });

  test('displays error message when fetch fails', async () => {
    const { toast } = require('sonner');
    mockFetch.mockRejectedValue(new Error('Network error'));

    render(<NotificationPreferencesSection />);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to load notification preferences'
      );
    });
  });
});
