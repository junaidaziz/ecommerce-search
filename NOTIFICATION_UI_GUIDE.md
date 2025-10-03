# Notifications Feature - UI/UX Design Guide

## Visual Design Overview

This document describes the visual design and user experience of the notification feature.

## 1. NotificationBell Dropdown

### Location
- Appears in the header (top-right area)
- Present in both UserHeader and BrandHeader
- Always accessible to logged-in users

### Visual Design

#### Bell Button
```
┌─────────────┐
│  🔔  (3)    │  ← Notification bell icon with badge
└─────────────┘
```

**Features:**
- Rounded button with subtle background
- Hover effect: slight scale (105%)
- Badge: Red circle with white text showing unread count
- Animated pulse effect on badge when unread > 0
- Badge shows "9+" for counts greater than 9

#### Dropdown Menu (Open State)
```
┌──────────────────────────────────────┐
│  Notifications    Mark all as read   │ ← Header
├──────────────────────────────────────┤
│ 📦 Order  ●                          │ ← Notification item
│ Your order #1234 has shipped         │
│ 2h ago                               │
├──────────────────────────────────────┤
│ 🎉 Promo                             │
│ New sale: 20% off all items          │
│ 1d ago                               │
├──────────────────────────────────────┤
│ 💰 Discount                          │
│ Flash sale ending soon!              │
│ 3d ago                               │
├──────────────────────────────────────┤
│      View all notifications          │ ← Footer
└──────────────────────────────────────┘
```

**Features:**
- Width: 384px (96 in Tailwind units)
- Max height: 400px with scroll
- Rounded corners (2xl)
- Shadow: Large shadow for depth
- Header: 
  - Sticky at top
  - Background color distinct from body
  - "Mark all as read" button (only visible if unread > 0)
- Notification items:
  - Type badge (color-coded)
  - Unread indicator (blue dot)
  - Bold text for unread
  - Hover effect: slight background change
  - Relative timestamp
- Footer:
  - "View all notifications" link
  - Takes user to full notification center
- Empty state:
  - Bell icon centered
  - "No notifications" message
  - "You're all caught up!" subtitle

#### Color Coding
- **Order Updates** (📦): Blue theme
  - Badge: `bg-blue-100 text-blue-800` (light mode)
  - Badge: `bg-blue-900 text-blue-200` (dark mode)

- **Promotions** (🎉): Purple theme
  - Badge: `bg-purple-100 text-purple-800` (light mode)
  - Badge: `bg-purple-900 text-purple-200` (dark mode)

- **Discounts** (💰): Green theme
  - Badge: `bg-green-100 text-green-800` (light mode)
  - Badge: `bg-green-900 text-green-200` (dark mode)

- **General** (📢): Gray theme
  - Badge: `bg-gray-100 text-gray-800` (light mode)
  - Badge: `bg-gray-800 text-gray-200` (dark mode)

## 2. Notification Center Page

### Location
- `/user/notifications`
- Accessible via "View all notifications" link from dropdown
- Can also navigate directly

### Layout
```
┌─────────────────────────────────────────────────────────┐
│  Notification Center                          (2 unread)│
│  Stay updated with order status, promotions, and more   │
├─────────────────────────────────────────────────────────┤
│  [All] [📦 Order Updates] [🎉 Promotions] ...          │ ← Filter tabs
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ 📦 Order Updates  [New]                           │ │ ← Card
│  │ Your order #1234 has shipped                      │ │
│  │ Jan 15, 2024, 2:30 PM                             │ │
│  │                            [Mark as read]          │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ 🎉 Promotions                                     │ │
│  │ New sale: 20% off all items                       │ │
│  │ Jan 14, 2024, 10:00 AM                            │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Header:
  - Large title
  - Subtitle with unread count badge
  - Badge: Primary color with white text
- Filter tabs:
  - Horizontal scrollable on mobile
  - Active tab: Primary background, white text
  - Inactive tabs: Light background, hover effect
  - Shows all types plus "All Notifications"
- Notification cards:
  - Rounded (2xl) with border
  - Unread: Primary colored border
  - Read: Gray border
  - Type badge at top
  - "New" badge for unread
  - Full message text
  - Formatted date/time
  - "Mark as read" button (unread only)
  - Hover: Shadow increase
- Empty state:
  - Large bell icon in circle
  - "No notifications" heading
  - Context-aware message based on filter
- Responsive: Single column on mobile, adapts to screen size

## 3. Notification Preferences (Settings)

### Location
- `/settings?tab=notifications`
- Accessible from Settings page sidebar
- New tab in settings navigation

### Layout
```
┌─────────────────────────────────────────────────────────┐
│  Notification Preferences                               │
│  Choose which notifications you want to receive         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Order Updates                            [●──]    │ │ ← Toggle
│  │ Get notified about your order status...           │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Promotions                               [──○]    │ │
│  │ Receive notifications about special offers...     │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Discounts                                [●──]    │ │
│  │ Be the first to know about discounts...           │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ General Updates                          [●──]    │ │
│  │ Stay informed about account changes...            │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Email Notifications                      [●──]    │ │
│  │ Receive email notifications in addition...        │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│                              [Save Preferences]         │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Header:
  - Large title
  - Descriptive subtitle
- Preference cards:
  - Rounded (xl) with subtle background
  - Hover effect: Background color change
  - Left side: Title (bold) and description
  - Right side: Toggle switch
  - Responsive: Stack on mobile
- Toggle switches:
  - Modern iOS-style design
  - Smooth animation on toggle
  - Primary color when enabled
  - Gray when disabled
  - Focus ring on keyboard navigation
- Save button:
  - Bottom right alignment
  - Primary color background
  - Loading state with spinner
  - Disabled state while saving
  - Success toast on save
- Loading state:
  - Skeleton animation
  - 5 placeholder cards
  - Smooth fade-in when loaded

### Settings Sidebar Integration
```
┌─────────────────────┐
│ ⚙️  Update Profile   │
│ 🏢 Brand Settings   │
│ 🔑 Change Password  │
│ 🏠 Manage Address   │
│ ✉️  Change Email     │
│ 💳 Payment Methods  │
│ 🏷️  Coupons & Offers│
│ 🔔 Notifications    │ ← New tab
└─────────────────────┘
```

## 4. Animations and Transitions

### Notification Bell
- Badge pulse: Continuous animation when unread > 0
- Button hover: Scale to 105% in 200ms
- Dropdown open: Fade-in + slide-down (200ms)
- Dropdown close: Fade-out (200ms)

### Notification Center
- Cards hover: Shadow increase (200ms)
- Tab switch: Smooth background transition (200ms)
- Loading: Skeleton pulse animation

### Preferences
- Toggle switch: Slide animation (200ms)
- Card hover: Background color transition (200ms)
- Save button: Spinner rotation when saving

## 5. Responsive Design

### Mobile (< 768px)
- NotificationBell: Full-width dropdown with max-width
- Notification Center: Single column, full-width cards
- Preferences: Stacked layout, full-width toggles
- Filter tabs: Horizontal scroll

### Tablet (768px - 1024px)
- NotificationBell: Fixed width dropdown
- Notification Center: Single column with padding
- Preferences: Single column with generous padding

### Desktop (> 1024px)
- NotificationBell: Right-aligned dropdown
- Notification Center: Centered with max-width
- Preferences: Optimal reading width

## 6. Dark Mode Support

All components fully support dark mode with:
- Adjusted background colors
- Proper contrast ratios
- Color-coded badges optimized for dark backgrounds
- Smooth theme transition animations

### Color Scheme
- Light mode: White backgrounds, gray text
- Dark mode: Dark gray backgrounds, light text
- Both modes: Consistent primary color accents

## 7. Accessibility

- Keyboard navigation: Full support for tab navigation
- Screen readers: Proper ARIA labels
- Focus indicators: Clear focus rings
- Color contrast: WCAG AA compliant
- Interactive elements: Minimum 44x44px touch targets

## 8. User Flow

### Receiving a Notification
1. New notification appears in database
2. Badge count updates (if bell is visible)
3. Badge pulses to draw attention
4. User clicks bell to view
5. Dropdown shows preview
6. User can mark as read or view all

### Managing Preferences
1. User navigates to Settings
2. Clicks "Notifications" tab
3. Sees current preferences
4. Toggles desired options
5. Clicks "Save Preferences"
6. Receives success confirmation
7. Future notifications respect preferences

### Viewing Notifications
1. User clicks "View all notifications"
2. Sees full notification center
3. Can filter by type
4. Can mark individual notifications as read
5. Empty state if no notifications in filter

## Summary

The notification system provides a polished, professional user experience with:
- ✅ Clear visual hierarchy
- ✅ Intuitive interactions
- ✅ Smooth animations
- ✅ Responsive design
- ✅ Dark mode support
- ✅ Accessibility features
- ✅ Color-coded organization
- ✅ User control via preferences
