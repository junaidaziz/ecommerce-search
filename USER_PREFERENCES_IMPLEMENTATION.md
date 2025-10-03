# User Preferences Implementation Summary

## Overview
This implementation adds comprehensive user preferences functionality to the e-commerce platform, allowing users to customize their language, currency, and communication preferences.

## Features Implemented

### 1. Database Schema
- Added `UserPreference` model to Prisma schema with the following fields:
  - `language`: Default language for the user interface (default: "en")
  - `currency`: Preferred currency for pricing (default: "USD")
  - `receiveOrderUpdates`: Boolean flag for order update notifications (default: true)
  - `receivePromotions`: Boolean flag for promotional emails (default: true)
- One-to-one relationship with User model (user can have one preference record)
- Automatic timestamps (createdAt, updatedAt)
- Cascade delete when user is deleted

### 2. Supported Languages
The system supports 12 languages:
- English (en)
- Español (es)
- Français (fr)
- Deutsch (de)
- Italiano (it)
- Português (pt)
- العربية (ar)
- اردو (ur)
- हिन्दी (hi)
- 中文 (zh)
- 日本語 (ja)
- 한국어 (ko)

### 3. Supported Currencies
The system supports 11 currencies:
- USD (US Dollar, $)
- EUR (Euro, €)
- GBP (British Pound, £)
- JPY (Japanese Yen, ¥)
- CNY (Chinese Yuan, ¥)
- INR (Indian Rupee, ₹)
- PKR (Pakistani Rupee, ₨)
- AED (UAE Dirham, د.إ)
- SAR (Saudi Riyal, ﷼)
- CAD (Canadian Dollar, C$)
- AUD (Australian Dollar, A$)

### 4. API Endpoints

#### GET /api/user/preferences
Returns the user's current preferences or default values if none exist.

**Response:**
```json
{
  "language": "en",
  "currency": "USD",
  "receiveOrderUpdates": true,
  "receivePromotions": true
}
```

#### PUT /api/user/preferences
Updates the user's preferences. Uses upsert to create preferences if they don't exist.

**Request Body:**
```json
{
  "language": "es",
  "currency": "EUR",
  "receiveOrderUpdates": true,
  "receivePromotions": false
}
```

**Validation:**
- Language must be a string
- Currency must be a string
- receiveOrderUpdates must be a boolean
- receivePromotions must be a boolean

### 5. UI Components

#### PreferencesSection Component
Located in `components/Settings/PreferencesSection.tsx`

**Features:**
- Language dropdown with all supported languages
- Currency dropdown with currency names and symbols
- Communication preferences checkboxes with descriptions
- Save button with loading state
- Success/error notifications
- Responsive design with dark mode support
- Follows existing design patterns from other settings sections

#### Updated SettingsSidebar
- Added "Preferences" tab with gear icon (Cog6ToothIcon)
- Positioned between "Brand Settings" and "Change Password"
- Maintains consistent styling with other tabs

#### Updated Settings Page
- Added "preferences" to the tab state type
- Integrated PreferencesSection component
- Tab routing supports preferences parameter

### 6. Type Definitions

#### New File: types/userPreference.ts
- UserPreference type (from Prisma)
- UserPreferenceInput type for API requests
- UserPreferenceResponse type for API responses
- SUPPORTED_LANGUAGES constant array
- SUPPORTED_CURRENCIES constant array

#### Updated: types/index.ts
- Exports all userPreference types

### 7. Database Functions

#### lib/users.ts
Added two new functions:

**getUserPreferences(userId: number)**
- Retrieves user preferences from database
- Returns default values if no preferences exist
- Returns only the relevant fields (language, currency, communication flags)

**updateUserPreferences(userId: number, data: UserPreferenceInput)**
- Uses Prisma upsert to create or update preferences
- Handles partial updates (only provided fields are updated)
- Creates preferences with defaults if they don't exist

### 8. Testing
Created comprehensive test suite in `__tests__/preferences.api.test.ts`:
- Authentication tests (requires login)
- User validation tests (404 if user not found)
- GET endpoint tests (returns preferences)
- PUT endpoint tests (updates preferences)
- Input validation tests (language, currency, boolean flags)
- Method validation tests (405 for unsupported methods)
- Error handling tests

### 9. Documentation
Updated `docs/ERD.md`:
- Added UserPreference entity to ER diagram
- Defined relationship between User and UserPreference
- Documented all fields in the diagram

## File Changes Summary

| File | Type | Lines Changed |
|------|------|---------------|
| `prisma/schema.prisma` | Modified | +16 |
| `lib/users.ts` | Modified | +45 |
| `types/userPreference.ts` | Created | +49 |
| `types/index.ts` | Modified | +1 |
| `pages/api/user/preferences.ts` | Created | +64 |
| `components/Settings/PreferencesSection.tsx` | Created | +165 |
| `components/Settings/SettingsSidebar.tsx` | Modified | +7 |
| `pages/settings.tsx` | Modified | +7 |
| `__tests__/preferences.api.test.ts` | Created | +182 |
| `docs/ERD.md` | Modified | +11 |
| **Total** | | **+547 lines** |

## Migration Required

To apply these changes to the database, run:
```bash
npx prisma migrate dev --name add_user_preferences
npx prisma generate
```

This will:
1. Create the UserPreference table
2. Add the relationship to the User table
3. Generate updated Prisma Client types

## Usage Flow

1. User navigates to Settings page
2. Clicks on "Preferences" tab in the sidebar
3. Sees current preferences (or defaults if none exist)
4. Selects preferred language from dropdown
5. Selects preferred currency from dropdown
6. Toggles communication preferences (order updates, promotions)
7. Clicks "Save Preferences" button
8. System validates input and saves to database
9. User sees success notification
10. Preferences are persisted per user

## Future Enhancements

Potential improvements for future iterations:
- Apply language preference to UI translations (i18n)
- Use currency preference in product pricing display
- Respect communication preferences in email notifications
- Add more communication preference options (SMS, push notifications)
- Add timezone preference
- Add date/time format preference
- Add accessibility preferences (font size, contrast)
- Add notification frequency settings

## Acceptance Criteria ✓

- ✅ Users can select their preferred language
- ✅ Users can select their preferred currency
- ✅ Users can opt-in/opt-out of order update notifications
- ✅ Users can opt-in/opt-out of promotional emails
- ✅ Preferences are stored in the database per user
- ✅ Preferences persist across sessions
- ✅ API endpoints are secured (require authentication)
- ✅ Input validation is implemented
- ✅ Default preferences are provided for new users
- ✅ UI is responsive and supports dark mode
- ✅ Comprehensive tests are included
