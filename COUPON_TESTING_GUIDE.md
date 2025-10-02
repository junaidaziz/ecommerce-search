# Coupon System Testing Guide

## Prerequisites
1. Have a brand account created and logged in
2. Access to brand dashboard at `/brand/dashboard`
3. Have some products in the system to test checkout

## Test Scenario 1: Create a Percentage Discount Coupon

### Steps:
1. Log in as a brand user
2. Navigate to Brand Dashboard (`/brand/dashboard`)
3. Click "Manage Coupons" button in the hero section
4. You should see the coupon management page
5. Fill in the form:
   - **Code**: SAVE10
   - **Discount Type**: Percentage Off
   - **Discount Value**: 10
   - **Min Order Value**: 20
   - **Expiry Date**: (leave empty or set future date)
   - **Usage Limit**: 100
   - **Description**: "10% off for orders over £20"
6. Click "Create Coupon"

### Expected Results:
- ✅ Success message appears: "Coupon created successfully!"
- ✅ Coupon appears in the table below with:
  - Code: SAVE10
  - Type: Percentage
  - Discount: 10%
  - Min Order: £20.00
  - Used/Limit: 0 / 100
  - Status: Active (green badge)
- ✅ Form clears after submission

## Test Scenario 2: Create a Fixed Amount Discount Coupon

### Steps:
1. On the coupon management page
2. Fill in the form:
   - **Code**: OFF5
   - **Discount Type**: Fixed Amount Off
   - **Discount Value**: 5
   - **Min Order Value**: (leave empty)
   - **Expiry Date**: (leave empty)
   - **Usage Limit**: (leave empty)
   - **Description**: "£5 off any order"
3. Click "Create Coupon"

### Expected Results:
- ✅ Success message appears
- ✅ Coupon appears with:
  - Discount: £5.00
  - Min Order: -
  - Used/Limit: 0 / ∞

## Test Scenario 3: Create a BOGO Coupon

### Steps:
1. Fill in the form:
   - **Code**: BOGO
   - **Discount Type**: Buy One Get One
   - **Discount Value**: 0
   - **Min Order Value**: (leave empty)
   - **Expiry Date**: (set to future date)
   - **Usage Limit**: 50
2. Click "Create Coupon"

### Expected Results:
- ✅ Coupon created successfully
- ✅ Shows BOGO type in table

## Test Scenario 4: Edit an Existing Coupon

### Steps:
1. In the coupons table, find the SAVE10 coupon
2. Click "Edit" button
3. Form should populate with existing values
4. Change:
   - **Discount Value**: 15
   - **Usage Limit**: 200
5. Click "Update Coupon"

### Expected Results:
- ✅ Success message: "Coupon updated successfully!"
- ✅ Table updates to show new values
- ✅ Discount: 15%
- ✅ Used/Limit: 0 / 200

## Test Scenario 5: Deactivate a Coupon

### Steps:
1. Find an active coupon in the table
2. Click "Deactivate" button

### Expected Results:
- ✅ Status badge changes from "Active" (green) to "Inactive" (gray)
- ✅ Button text changes to "Activate"

## Test Scenario 6: Activate a Coupon

### Steps:
1. Find the deactivated coupon
2. Click "Activate" button

### Expected Results:
- ✅ Status badge changes to "Active" (green)
- ✅ Button text changes to "Deactivate"

## Test Scenario 7: Apply Valid Coupon at Checkout

### Steps:
1. Add products to cart (total should be at least £20)
2. Navigate to checkout (`/checkout`)
3. Find the "Have a Coupon Code?" section
4. Enter: SAVE10
5. Click "Apply"

### Expected Results:
- ✅ Input border turns green
- ✅ Green checkmark appears in input field
- ✅ Success message appears: "10% discount applied!"
- ✅ Discount is reflected in the cart total
- ✅ Used count increments in brand's coupon table (after order completion)

## Test Scenario 8: Apply Invalid Coupon at Checkout

### Steps:
1. At checkout page
2. Enter: INVALID123
3. Click "Apply"

### Expected Results:
- ✅ Input border turns red
- ✅ Red X appears in input field
- ✅ Error message appears: "Invalid or expired coupon code"
- ✅ No discount applied

## Test Scenario 9: Test Minimum Order Validation

### Steps:
1. Add products to cart with total less than £20 (e.g., £15)
2. Navigate to checkout
3. Enter: SAVE10
4. Click "Apply"

### Expected Results:
- ✅ Input border turns red
- ✅ Red X appears
- ✅ Error message: "Minimum order value of £20.00 required"
- ✅ No discount applied

## Test Scenario 10: Test BOGO with Insufficient Items

### Steps:
1. Add only 1 product to cart
2. Navigate to checkout
3. Enter: BOGO
4. Click "Apply"

### Expected Results:
- ✅ Error message: "This coupon requires at least 2 items in cart"
- ✅ No discount applied

## Test Scenario 11: Test BOGO with Sufficient Items

### Steps:
1. Add 2 or more products to cart
2. Navigate to checkout
3. Enter: BOGO
4. Click "Apply"

### Expected Results:
- ✅ Success message: "Buy one get one discount applied!"
- ✅ Discount equals price of cheapest item
- ✅ Green checkmark appears

## Test Scenario 12: Test Expired Coupon

### Steps:
1. As brand, create a coupon with expiry date in the past
2. Try to apply it at checkout

### Expected Results:
- ✅ Error message: "Coupon expired"
- ✅ In brand dashboard, status shows "Expired" (red badge)

## Test Scenario 13: Test Usage Limit Reached

### Steps:
1. Create a coupon with usage limit of 1
2. Apply it successfully once (complete order if needed)
3. Try to apply it again

### Expected Results:
- ✅ Error message: "Coupon usage limit reached"
- ✅ In brand dashboard, status shows "Limit Reached" (orange badge)

## Test Scenario 14: Uppercase Auto-Conversion

### Steps:
1. At checkout, in coupon input field
2. Type in lowercase: save10

### Expected Results:
- ✅ Text automatically converts to: SAVE10

## Test Scenario 15: Verify Brand Isolation

### Steps:
1. Create coupons as Brand A
2. Log out and log in as Brand B
3. Go to Brand B's coupon management page

### Expected Results:
- ✅ Brand B only sees their own coupons
- ✅ Brand B cannot see Brand A's coupons
- ✅ Brand B cannot edit Brand A's coupons

## Test Scenario 16: Test Multiple Coupon Types Display

### Steps:
1. Create at least one of each type:
   - Percentage (e.g., SAVE10)
   - Fixed Amount (e.g., OFF5)
   - BOGO (e.g., BOGO)
2. View the coupons table

### Expected Results:
- ✅ Each type displays correctly in the Type column
- ✅ Discount values format correctly:
  - Percentage: "10%"
  - Fixed Amount: "£5.00"
  - BOGO: "BOGO"

## Edge Cases to Test

### Empty Form Validation
- Try submitting form with empty code → Should show HTML5 required field validation
- Try submitting with empty discount value → Should validate

### Duplicate Coupon Code
- Try creating a coupon with code that already exists
- Should get error from API (unique constraint)

### Large Numbers
- Try entering very large discount value (e.g., 999999)
- Try entering large usage limit
- Should handle gracefully

### Special Characters in Code
- Try entering code with special characters: "SAVE-10%"
- System should accept alphanumeric only

### Mobile Responsiveness
- Test on mobile device or browser dev tools
- ✅ Form should be responsive
- ✅ Table should scroll horizontally if needed
- ✅ Buttons should be touch-friendly

## Performance Testing

### Load Time
- Navigate to `/brand/coupons` → Should load quickly
- Table should render smoothly even with many coupons

### Form Submission
- Creating/updating coupon should be fast
- Success message should appear immediately

### Checkout Validation
- Coupon validation should be near-instant
- No noticeable lag when clicking Apply

## Accessibility Testing

### Keyboard Navigation
- Tab through form fields → Should work smoothly
- Enter key on Apply button → Should apply coupon

### Screen Reader
- Labels should be properly associated with inputs
- Success/error messages should be announced

## Browser Compatibility
Test in:
- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Expected Behavior Summary

| Action | Success Criteria |
|--------|-----------------|
| Create Coupon | Success message, appears in table, form clears |
| Edit Coupon | Updates reflected immediately, success message |
| Activate/Deactivate | Status badge changes, button text updates |
| Apply Valid Coupon | Green checkmark, success message, discount applied |
| Apply Invalid Coupon | Red X, error message, no discount |
| Minimum Order Not Met | Red X, specific error about minimum |
| BOGO <2 items | Error about needing 2+ items |
| Expired Coupon | Error message, red badge in dashboard |
| Usage Limit Reached | Error message, orange badge |

## Reporting Issues
When reporting issues, include:
1. Browser and version
2. User role (Brand/Customer)
3. Steps to reproduce
4. Expected vs actual behavior
5. Screenshots if UI-related
6. Console errors if applicable
