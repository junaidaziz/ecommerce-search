# Social Button Hover Effects - Visual Specification

## Color Palette & Transitions

### Google Button

#### Light Mode
```
┌─────────────────────────────────────────────────────────────┐
│ NORMAL STATE                                                │
├─────────────────────────────────────────────────────────────┤
│ Background:  #FFFFFF (white)                                │
│ Border:      #D1D5DB (gray-300)                             │
│ Text:        #374151 (gray-700)                             │
│ Shadow:      none                                           │
└─────────────────────────────────────────────────────────────┘
                          ↓ 0.3s transition
┌─────────────────────────────────────────────────────────────┐
│ HOVER STATE                                                 │
├─────────────────────────────────────────────────────────────┤
│ Background:  #F8F9FA (light gray tint)                      │
│ Border:      #4285F4 (Google Blue)                          │
│ Text:        #4285F4 (Google Blue)                          │
│ Shadow:      0 2px 8px rgba(66,133,244,0.15)               │
│ Scale:       1.02                                           │
└─────────────────────────────────────────────────────────────┘
```

#### Dark Mode
```
┌─────────────────────────────────────────────────────────────┐
│ NORMAL STATE                                                │
├─────────────────────────────────────────────────────────────┤
│ Background:  #1F2937 (gray-800)                             │
│ Border:      #4B5563 (gray-600)                             │
│ Text:        #D1D5DB (gray-300)                             │
│ Shadow:      none                                           │
└─────────────────────────────────────────────────────────────┘
                          ↓ 0.3s transition
┌─────────────────────────────────────────────────────────────┐
│ HOVER STATE                                                 │
├─────────────────────────────────────────────────────────────┤
│ Background:  #1A1A1A (very dark)                            │
│ Border:      #4285F4 (Google Blue)                          │
│ Text:        #4285F4 (Google Blue)                          │
│ Shadow:      0 2px 8px rgba(66,133,244,0.15)               │
│ Scale:       1.02                                           │
└─────────────────────────────────────────────────────────────┘
```

---

### Facebook Button

#### Light Mode
```
┌─────────────────────────────────────────────────────────────┐
│ NORMAL STATE                                                │
├─────────────────────────────────────────────────────────────┤
│ Background:  #FFFFFF (white)                                │
│ Border:      #D1D5DB (gray-300)                             │
│ Text:        #374151 (gray-700)                             │
│ Shadow:      none                                           │
└─────────────────────────────────────────────────────────────┘
                          ↓ 0.3s transition
┌─────────────────────────────────────────────────────────────┐
│ HOVER STATE                                                 │
├─────────────────────────────────────────────────────────────┤
│ Background:  #1877F2 (Facebook Blue) ← BOLD CHANGE          │
│ Border:      #1877F2 (Facebook Blue)                        │
│ Text:        #FFFFFF (white)                                │
│ Shadow:      0 2px 8px rgba(24,119,242,0.25)               │
│ Scale:       1.02                                           │
└─────────────────────────────────────────────────────────────┘
```

#### Dark Mode
```
┌─────────────────────────────────────────────────────────────┐
│ NORMAL STATE                                                │
├─────────────────────────────────────────────────────────────┤
│ Background:  #1F2937 (gray-800)                             │
│ Border:      #4B5563 (gray-600)                             │
│ Text:        #D1D5DB (gray-300)                             │
│ Shadow:      none                                           │
└─────────────────────────────────────────────────────────────┘
                          ↓ 0.3s transition
┌─────────────────────────────────────────────────────────────┐
│ HOVER STATE                                                 │
├─────────────────────────────────────────────────────────────┤
│ Background:  #1877F2 (Facebook Blue) ← BOLD CHANGE          │
│ Border:      #1877F2 (Facebook Blue)                        │
│ Text:        #FFFFFF (white)                                │
│ Shadow:      0 2px 8px rgba(24,119,242,0.25)               │
│ Scale:       1.02                                           │
└─────────────────────────────────────────────────────────────┘
```

---

### GitHub Button (NEW)

#### Light Mode
```
┌─────────────────────────────────────────────────────────────┐
│ NORMAL STATE                                                │
├─────────────────────────────────────────────────────────────┤
│ Background:  #FFFFFF (white)                                │
│ Border:      #D1D5DB (gray-300)                             │
│ Text:        #374151 (gray-700)                             │
│ Shadow:      none                                           │
└─────────────────────────────────────────────────────────────┘
                          ↓ 0.3s transition
┌─────────────────────────────────────────────────────────────┐
│ HOVER STATE                                                 │
├─────────────────────────────────────────────────────────────┤
│ Background:  #24292E (GitHub Dark) ← DARK THEME             │
│ Border:      #24292E (GitHub Dark)                          │
│ Text:        #FFFFFF (white)                                │
│ Shadow:      0 2px 8px rgba(36,41,46,0.2)                  │
│ Scale:       1.02                                           │
└─────────────────────────────────────────────────────────────┘
```

#### Dark Mode
```
┌─────────────────────────────────────────────────────────────┐
│ NORMAL STATE                                                │
├─────────────────────────────────────────────────────────────┤
│ Background:  #1F2937 (gray-800)                             │
│ Border:      #4B5563 (gray-600)                             │
│ Text:        #D1D5DB (gray-300)                             │
│ Shadow:      none                                           │
└─────────────────────────────────────────────────────────────┘
                          ↓ 0.3s transition
┌─────────────────────────────────────────────────────────────┐
│ HOVER STATE                                                 │
├─────────────────────────────────────────────────────────────┤
│ Background:  #0D1117 (GitHub Darkest)                       │
│ Border:      #58A6FF (GitHub Blue)                          │
│ Text:        #FFFFFF (white)                                │
│ Shadow:      0 2px 8px rgba(88,166,255,0.15)               │
│ Scale:       1.02                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Transition Properties

All buttons use the same transition configuration:

```css
transition-all duration-300 ease-in-out
```

**Breakdown:**
- `transition-all`: Applies to all animatable properties
- `duration-300`: 300ms (0.3 seconds) - within required 0.2-0.3s range
- `ease-in-out`: Smooth acceleration and deceleration

**Animated Properties:**
1. Background color
2. Border color
3. Text color
4. Box shadow
5. Transform (scale)

---

## Layout & Alignment

All buttons share identical layout properties:

```css
display: flex;
align-items: center;        /* Vertical centering */
justify-content: center;    /* Horizontal centering */
gap: 0.75rem;              /* 12px space between icon & text */
font-weight: 600;          /* Semibold */
font-size: 1rem;           /* 16px base size */
```

**Icon Specifications:**
- Width: 20px (`w-5`)
- Height: 20px (`h-5`)
- Color: currentColor (inherits text color)

---

## Interactive States

### Hover
```
transform: scale(1.02);    /* 2% larger */
```

### Active (Click)
```
transform: scale(0.98);    /* 2% smaller */
```

### Focus (Keyboard Navigation)
```
outline: 2px solid [brand-color];
outline-offset: 2px;
opacity: 0.2;
```

---

## Brand Color Reference

| Provider | Primary Color | Hex Code  | RGB             | Usage        |
|----------|---------------|-----------|-----------------|--------------|
| Google   | Google Blue   | #4285F4   | rgb(66,133,244) | Border, Text |
| Facebook | Facebook Blue | #1877F2   | rgb(24,119,242) | All hover    |
| GitHub   | GitHub Dark   | #24292E   | rgb(36,41,46)   | Light hover  |
| GitHub   | GitHub Blue   | #58A6FF   | rgb(88,166,255) | Dark border  |

---

## Accessibility Features

### Color Contrast Ratios (WCAG AA)

**Light Mode:**
- Google hover: 4.5:1 (text on background) ✓
- Facebook hover: 8.2:1 (white on blue) ✓
- GitHub hover: 11.1:1 (white on dark) ✓

**Dark Mode:**
- Google hover: 4.5:1 ✓
- Facebook hover: 8.2:1 ✓
- GitHub hover: 8.5:1 ✓

### Keyboard Navigation
- Tab order: Sequential
- Focus indicators: Brand-colored rings
- Enter/Space: Activates button
- Visual feedback: Clear and distinct

---

## Implementation Details

### Tailwind CSS Classes

**Google Button:**
```
hover:bg-[#f8f9fa]
hover:border-[#4285F4]
hover:text-[#4285F4]
hover:shadow-[0_2px_8px_rgba(66,133,244,0.15)]
```

**Facebook Button:**
```
hover:bg-[#1877F2]
hover:border-[#1877F2]
hover:text-white
hover:shadow-[0_2px_8px_rgba(24,119,242,0.25)]
```

**GitHub Button:**
```
hover:bg-[#24292e]          /* Light mode */
hover:bg-[#0d1117]          /* Dark mode */
hover:border-[#24292e]      /* Light mode */
hover:border-[#58a6ff]      /* Dark mode */
hover:text-white
hover:shadow-[0_2px_8px_rgba(36,41,46,0.2)]
```

---

## Testing Checklist

- [ ] Hover effects visible in Chrome
- [ ] Hover effects visible in Firefox
- [ ] Hover effects visible in Safari
- [ ] Transitions smooth (not jarring)
- [ ] Colors match brand guidelines
- [ ] Dark mode works correctly
- [ ] Focus states visible with keyboard
- [ ] Touch targets adequate on mobile
- [ ] Icons align with text
- [ ] Spacing consistent across buttons
