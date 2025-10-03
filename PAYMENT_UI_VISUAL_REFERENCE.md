# Payment Methods UI - Visual Reference

## Tab Interface (Desktop View)
```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         Add New Payment Method                                │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                     │
│  │ 💳 Card  │  │ 🟣 Stripe │  │ 🔵 PayPal │  │ 🟢 Bank  │                     │
│  │ (Active) │  │          │  │          │  │          │                     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘                     │
│                                                                                │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Tab Interface (Mobile View)
```
┌────────────────────────────────────────┐
│    Add New Payment Method              │
├────────────────────────────────────────┤
│                                        │
│  ┌──────────┐  ┌──────────┐           │
│  │ 💳 Card  │  │ 🟣 Stripe │           │
│  └──────────┘  └──────────┘           │
│                                        │
│  ┌──────────┐  ┌──────────┐           │
│  │ 🔵 PayPal │  │ 🟢 Bank  │           │
│  └──────────┘  └──────────┘           │
│                                        │
└────────────────────────────────────────┘
```

## Form Views

### 1. Card Form (Default)
```
┌──────────────────────────────────────────────────────────────┐
│ Card Number                                                   │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 💳 1234 5678 9012 3456                                   │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                               │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐                    │
│ │ Month    │  │ Year     │  │ CVC      │                    │
│ │ MM       │  │ YYYY     │  │ ***      │                    │
│ └──────────┘  └──────────┘  └──────────┘                    │
│                                                               │
│ ☐ Set as default payment method                              │
│                                                               │
│                            [Add Payment Method]               │
└──────────────────────────────────────────────────────────────┘
```

### 2. Stripe Form
```
┌──────────────────────────────────────────────────────────────┐
│ Card Number                                                   │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 💳 1234 5678 9012 3456                                   │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                               │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐                    │
│ │ Month    │  │ Year     │  │ CVC      │                    │
│ │ MM       │  │ YYYY     │  │ ***      │                    │
│ └──────────┘  └──────────┘  └──────────┘                    │
│                                                               │
│ ☐ Set as default payment method                              │
│                                                               │
│                            [Add Payment Method]               │
└──────────────────────────────────────────────────────────────┘
```

### 3. PayPal Form
```
┌──────────────────────────────────────────────────────────────┐
│ PayPal Email Address                                          │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ your.email@example.com                                   │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                               │
│ ☐ Set as default payment method                              │
│                                                               │
│                            [Add Payment Method]               │
└──────────────────────────────────────────────────────────────┘
```

### 4. Bank Details Form (NEW)
```
┌──────────────────────────────────────────────────────────────┐
│ Bank Name                                                     │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ e.g., Chase Bank                                         │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                               │
│ ┌─────────────────────────────┐  ┌─────────────────────────┐│
│ │ Account Number              │  │ Account Type            ││
│ │ Account number              │  │ ▼ Checking              ││
│ └─────────────────────────────┘  └─────────────────────────┘│
│                                                               │
│ Routing Number                                                │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ 9-digit routing number                                   │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                               │
│ ☐ Set as default payment method                              │
│                                                               │
│                            [Add Payment Method]               │
└──────────────────────────────────────────────────────────────┘
```

## Payment Methods List Display

### Example with All Payment Types
```
┌────────────────────────────────────────────────────────────────────────────┐
│                          Payment Methods                                    │
│                     Manage your saved payment cards                         │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│ ┌──────────────────────────────────────────────────────────────────────┐   │
│ │ 💳 visa ****4242            [⭐ Default]  [Delete]                   │   │
│ │    Expires 12/2025                                                   │   │
│ └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│ ┌──────────────────────────────────────────────────────────────────────┐   │
│ │ 🟣 Stripe - mastercard ****5678         [Make Default] [Delete]      │   │
│ │    Payment ID: pm_1234567...                                         │   │
│ └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│ ┌──────────────────────────────────────────────────────────────────────┐   │
│ │ 🔵 PayPal                               [Make Default] [Delete]      │   │
│ │    user@example.com                                                  │   │
│ └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│ ┌──────────────────────────────────────────────────────────────────────┐   │
│ │ 🟢 Chase Bank - checking                [Make Default] [Delete]      │   │
│ │    Account ****1234 | Routing: 123456789                             │   │
│ └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└────────────────────────────────────────────────────────────────────────────┘
```

### Empty State
```
┌────────────────────────────────────────────────────────────────────────────┐
│                          Payment Methods                                    │
│                     Manage your saved payment cards                         │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                                  💳                                          │
│                                                                              │
│                     No payment methods added yet                             │
│           Add a card, Stripe, PayPal, or bank account below to get started  │
│                                                                              │
└────────────────────────────────────────────────────────────────────────────┘
```

## Color Scheme

- **Card**: Blue/Primary color (#primary)
- **Stripe**: Purple (#6B46C1 / purple-600)
- **PayPal**: Blue (#2563EB / blue-600)
- **Bank**: Green (#059669 / green-600)
- **Default Badge**: Primary color with background
- **Delete Button**: Red (#DC2626 / red-600)
- **Make Default Button**: Primary color

## Responsive Behavior

- **Desktop (≥640px)**: 4-column tab grid
- **Mobile (<640px)**: 2-column tab grid
- **Buttons**: Stack vertically on mobile, horizontal on desktop
- **Form inputs**: Full width on all screens

## Validation States

### Valid Input
- Border: Gray (#D1D5DB / gray-300)
- Focus ring: Primary color

### Invalid Input
- Border: Red (#EF4444 / red-500)
- Error text: Red, displayed below field

### Disabled Submit Button
- Opacity: 50%
- Cursor: not-allowed
- Conditions:
  - Card/Stripe: Invalid card number, expiry, or CVC
  - PayPal: Invalid email format
  - Bank: Missing or invalid bank details

## Dark Mode

All components support dark mode with automatic theme detection:
- Background: `dark:bg-gray-900`
- Text: `dark:text-white`
- Borders: `dark:border-gray-700`
- Inputs: `dark:bg-gray-800`
- Cards: `dark:bg-gray-800`
