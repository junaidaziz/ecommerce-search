# Profile Settings UI - Visual Description

## Page Layout

### Settings Page Structure
```
┌─────────────────────────────────────────────────────────┐
│                      Header                              │
├──────────────┬──────────────────────────────────────────┤
│              │                                           │
│   Sidebar    │          Main Content Area                │
│              │                                           │
│  • Profile   │    [Selected Section Content]             │
│  • Password  │                                           │
│  • Address ← │                                           │
│  • Email     │                                           │
│  • Payments  │                                           │
│  • Coupons   │                                           │
│              │                                           │
└──────────────┴──────────────────────────────────────────┘
```

## Profile Section (UpdateProfileSection)

### Layout
```
┌────────────────────────────────────────────────────────┐
│  ┌────────────────────────────────────────────────┐    │
│  │              Profile Picture                    │    │
│  │         (Avatar with Upload Button)             │    │
│  └────────────────────────────────────────────────┘    │
│  ─────────────────────────────────────────────────     │
│                                                         │
│  ┌───────────────────────┐ ┌───────────────────────┐  │
│  │ First Name            │ │ Last Name             │  │
│  │ [John............]    │ │ [Doe.............]    │  │
│  └───────────────────────┘ └───────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────┐               │
│  │ Email                                │               │
│  │ [john.doe@example.com (readonly)]   │ [Change Email]│
│  └─────────────────────────────────────┘               │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Phone Number                                      │ │
│  │ [+1 234 567 8900........................]        │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Last Updated                                      │ │
│  │ [2023-10-03 12:34 PM (readonly)]                 │ │
│  └───────────────────────────────────────────────────┘ │
│  ─────────────────────────────────────────────────     │
│                                       [Save Changes]    │
└────────────────────────────────────────────────────────┘
```

## Address Management Section (ManageAddressSection)

### Main Layout
```
┌────────────────────────────────────────────────────────────┐
│  ┌─┐                                                       │
│  │📍│ Manage Addresses                        [+ Add New]  │
│  └─┘ Manage your shipping and billing addresses           │
│  ──────────────────────────────────────────────────────    │
│                                                             │
│  [Address Form - Shown when "Add New" or "Edit" clicked]   │
│                                                             │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  Shipping Addresses                                         │
│  ─────────────────────────────────────────────────────     │
│                                                             │
│  ┌────────────────────────┐  ┌────────────────────────┐   │
│  │ [DEFAULT]              │  │                        │   │
│  │ John Doe               │  │ Jane Doe               │   │
│  │ 123 Main St            │  │ 456 Oak Ave            │   │
│  │ Apt 4B                 │  │ Suite 200              │   │
│  │ New York, NY 10001     │  │ Boston, MA 02101       │   │
│  │ United States          │  │ United States          │   │
│  │ +1 234 567 8900        │  │ +1 234 567 8901        │   │
│  │                        │  │                        │   │
│  │ [✏️ Edit] [🗑️ Delete]  │  │ [✏️ Edit] [🗑️ Delete]  │   │
│  └────────────────────────┘  └────────────────────────┘   │
│                                                             │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  Billing Addresses                                          │
│  ─────────────────────────────────────────────────────     │
│                                                             │
│  ┌────────────────────────┐  ┌────────────────────────┐   │
│  │ [DEFAULT]              │  │                        │   │
│  │ John Doe               │  │ Jane Doe               │   │
│  │ 789 Pine St            │  │ 321 Elm St             │   │
│  │                        │  │                        │   │
│  │ Chicago, IL 60601      │  │ Miami, FL 33101        │   │
│  │ United States          │  │ United States          │   │
│  │                        │  │ +1 234 567 8903        │   │
│  │                        │  │                        │   │
│  │ [✏️ Edit] [🗑️ Delete]  │  │ [✏️ Edit] [🗑️ Delete]  │   │
│  └────────────────────────┘  └────────────────────────┘   │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### Address Form (Shown Inline)
```
┌────────────────────────────────────────────────────────────┐
│  New Address / Edit Address                     [Cancel]   │
│  ──────────────────────────────────────────────────────    │
│                                                             │
│  ◉ Shipping Address    ○ Billing Address                   │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Full Name                                             │ │
│  │ [John Doe..........................................]  │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Address Line 1                                        │ │
│  │ [123 Main St......................................]  │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Address Line 2 (Optional)                             │ │
│  │ [Apt, Suite, Unit, Building, Floor, etc...........]  │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────┐ ┌───────────────────────────┐  │
│  │ City                  │ │ State/Province            │  │
│  │ [New York........]    │ │ [NY..................]    │  │
│  └───────────────────────┘ └───────────────────────────┘  │
│                                                             │
│  ┌───────────────────────┐ ┌───────────────────────────┐  │
│  │ Postal Code           │ │ Country                   │  │
│  │ [10001...........]    │ │ [United States ▼]         │  │
│  └───────────────────────┘ └───────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ Phone Number (Optional)                               │ │
│  │ [+1 234 567 8900..................................]  │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ☑ Set as default address                                  │
│  ──────────────────────────────────────────────────────    │
│                              [Cancel] [✓ Save Address]     │
└────────────────────────────────────────────────────────────┘
```

## Color Scheme & Visual Design

### Colors
- **Primary**: Blue/Purple gradient (#6366f1 → #8b5cf6)
- **Background**: White (light mode), Dark Gray (#111827 - dark mode)
- **Text**: Gray-900 (light), White (dark)
- **Borders**: Gray-200 (light), Gray-800 (dark)
- **Success**: Green (#10b981)
- **Error**: Red (#ef4444)
- **Default Badge**: Primary with 20% opacity background

### Visual Elements
- **Rounded Corners**: 0.5rem to 1rem (8px to 16px)
- **Shadows**: Subtle drop shadows on cards
- **Spacing**: Consistent 1rem to 2rem gaps
- **Icons**: Heroicons (outline style)
- **Typography**: System font stack, 14px-18px for body

### Interactive States
- **Hover**: Slight color darkening, scale 1.02, shadow increase
- **Active**: Primary color fill for buttons
- **Disabled**: 50% opacity, no pointer
- **Focus**: Ring outline in primary color

### Responsive Breakpoints
- **Mobile**: < 768px (1 column)
- **Tablet**: 768px - 1024px (1-2 columns)
- **Desktop**: > 1024px (2 columns)

## Address Card Styling

### Default Address
- Border: 2px solid primary color
- Background: Primary with 5% opacity
- Badge: "DEFAULT" in primary color with 20% opacity background

### Regular Address
- Border: 2px solid gray-200 (light) / gray-700 (dark)
- Background: Gray-50 (light) / Gray-800 (dark)
- No badge

### Edit Button
- Text color: Primary
- Background: Primary with 10% opacity
- Hover: Primary background with white text
- Icon: Pencil

### Delete Button
- Text color: Red-600
- Background: Red with 10% opacity  
- Hover: Red background with white text
- Icon: Trash

## Form Validation

### Visual Indicators
- **Valid**: No special indicator
- **Invalid**: Red border, red error text below field
- **Required**: Asterisk or "(Required)" label
- **Optional**: "(Optional)" in gray text

### Error Messages
- Display below field
- Red text color
- Small font size (12px)
- Appears smoothly with fade-in

## Loading States

### Save Button
- Disabled state
- Spinning circle icon
- "Saving..." text
- No hover effects

### Address List
- Skeleton loaders or spinner while fetching
- Smooth fade-in when loaded

## Accessibility Features

- Proper ARIA labels
- Keyboard navigation support
- Focus visible states
- Semantic HTML
- Screen reader friendly
- Color contrast meets WCAG AA standards

## Mobile Responsive Behavior

### < 768px
- Single column layout
- Full-width cards
- Stacked form fields
- Larger touch targets (44px minimum)
- Bottom sheet for forms
- Sticky save button

### 768px - 1024px
- Two-column grid for addresses
- Side-by-side form fields where appropriate
- Adequate spacing

### > 1024px
- Two-column grid maintained
- Maximum width container (4xl)
- Centered content
- Wider spacing

## Animation & Transitions

- Form show/hide: Smooth slide and fade (200ms)
- Button hover: 150ms ease-in-out
- Card hover: 200ms ease
- Address card appearance: Stagger fade-in
- Error messages: 200ms fade-in

## Empty States

### No Shipping Addresses
```
┌────────────────────────────────────────────┐
│                                             │
│         No shipping addresses saved yet.    │
│                                             │
└────────────────────────────────────────────┘
```

### No Billing Addresses
```
┌────────────────────────────────────────────┐
│                                             │
│         No billing addresses saved yet.     │
│                                             │
└────────────────────────────────────────────┘
```

## Confirmation Dialogs

### Delete Address
```
┌─────────────────────────────────────────────┐
│  ⚠️  Are you sure you want to delete this   │
│      address?                                │
│                                              │
│              [Cancel] [Delete]               │
└─────────────────────────────────────────────┘
```

## Success/Error Notifications

Appear as toast notifications:
```
┌─────────────────────────────────────┐
│  ✓ Address added successfully       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  ✓ Address updated successfully     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  ✓ Address deleted successfully     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  ✗ Failed to save address           │
└─────────────────────────────────────┘
```

Position: Top-right corner
Duration: 3-5 seconds
Style: Slide in from right, fade out
