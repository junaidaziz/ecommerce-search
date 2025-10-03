import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SettingsSidebar from '@components/Settings/SettingsSidebar';

// Mock heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  KeyIcon: () => <svg data-testid="key-icon" />,
  HomeIcon: () => <svg data-testid="home-icon" />,
  EnvelopeIcon: () => <svg data-testid="envelope-icon" />,
  CreditCardIcon: () => <svg data-testid="credit-card-icon" />,
  TagIcon: () => <svg data-testid="tag-icon" />,
  UserIcon: () => <svg data-testid="user-icon" />,
  BuildingStorefrontIcon: () => <svg data-testid="building-storefront-icon" />,
  ShoppingBagIcon: () => <svg data-testid="shopping-bag-icon" />,
  HeartIcon: () => <svg data-testid="heart-icon" />,
  BellIcon: () => <svg data-testid="bell-icon" />,
}));

describe('SettingsSidebar', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders all tabs for regular users', () => {
    render(
      <SettingsSidebar 
        active="profile" 
        onSelect={mockOnSelect} 
        userRole="USER" 
      />
    );

    expect(screen.getByText('Update Profile')).toBeInTheDocument();
    expect(screen.getByText('Order History')).toBeInTheDocument();
    expect(screen.getByText('My Wishlist')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Change Password')).toBeInTheDocument();
    expect(screen.getByText('Manage Address')).toBeInTheDocument();
    expect(screen.getByText('Change Email')).toBeInTheDocument();
    expect(screen.getByText('Payment Methods')).toBeInTheDocument();
    expect(screen.getByText('Coupons & Offers')).toBeInTheDocument();
  });

  test('hides brand settings tab for non-brand users', () => {
    render(
      <SettingsSidebar 
        active="profile" 
        onSelect={mockOnSelect} 
        userRole="USER" 
      />
    );

    expect(screen.queryByText('Brand Settings')).not.toBeInTheDocument();
  });

  test('shows brand settings tab for brand users', () => {
    render(
      <SettingsSidebar 
        active="profile" 
        onSelect={mockOnSelect} 
        userRole="BRAND" 
      />
    );

    expect(screen.getByText('Brand Settings')).toBeInTheDocument();
  });

  test('highlights active tab', () => {
    render(
      <SettingsSidebar 
        active="orders" 
        onSelect={mockOnSelect} 
        userRole="USER" 
      />
    );

    const ordersButton = screen.getByText('Order History').closest('button');
    expect(ordersButton).toHaveClass('bg-primary');
    expect(ordersButton).toHaveClass('text-white');
  });

  test('calls onSelect when a tab is clicked', () => {
    render(
      <SettingsSidebar 
        active="profile" 
        onSelect={mockOnSelect} 
        userRole="USER" 
      />
    );

    const wishlistButton = screen.getByText('My Wishlist').closest('button');
    fireEvent.click(wishlistButton!);

    expect(mockOnSelect).toHaveBeenCalledWith('wishlist');
  });

  test('new tabs (orders, wishlist, notifications) are visible', () => {
    render(
      <SettingsSidebar 
        active="profile" 
        onSelect={mockOnSelect} 
        userRole="USER" 
      />
    );

    // Verify all new tabs are present
    expect(screen.getByText('Order History')).toBeInTheDocument();
    expect(screen.getByText('My Wishlist')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  test('renders correct icons for new tabs', () => {
    render(
      <SettingsSidebar 
        active="profile" 
        onSelect={mockOnSelect} 
        userRole="USER" 
      />
    );

    expect(screen.getByTestId('shopping-bag-icon')).toBeInTheDocument();
    expect(screen.getByTestId('heart-icon')).toBeInTheDocument();
    expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
  });
});
