# Hardcoded Radius Values Audit Report

**Report Generated:** 2026-04-01  
**Scope:** Complete codebase audit (excluding node_modules, .react-router)  
**Thoroughness Level:** Very Thorough

---

## Executive Summary

- ✅ **No `rounded-none` usage found** - Clean!
- 📊 **30 total instances** of hardcoded radius values found
- 📂 **11 files** affected
- 🎯 **8 critical instances** requiring immediate attention (Category A)
- ⚠️ **20 instances** in dynamic mapping systems (Category B - intentional design)
- ℹ️ **2 instances** in editor configuration (Category C - low priority)

---

## Detailed Findings

### Category A: Direct Hardcoded Values ❌
**Action Required:** Replace with `rounded-(--radius)` variable

| File | Line | Current Class | Element | Issue |
|------|------|--------------|---------|-------|
| app/sections/testimonials/item.tsx | 39 | `rounded-sm` | `<figure>` card container | Testimonial card background missing global styling |
| app/components/product/product-option-values.tsx | 100 | `rounded-lg` | `<Select.ScrollDownButton>` | Radix UI dropdown scroll button |
| app/components/cart/cart-summary.tsx | 61 | `rounded-sm` | `<div>` sticky container | Cart summary page layout |
| app/components/cart/cart-summary.tsx | 77 | `rounded-md` | `<div>` badge | Gift card badge styling |
| app/components/cart/cart-summary.tsx | 134 | `rounded-md` | `<div>` badge | Discount code badge styling |
| app/routes/account/orders/list.tsx | 189 | `rounded-md` | `<span>` badge | Financial status indicator |
| app/routes/account/orders/list.tsx | 193 | `rounded-md` | `<span>` badge | Fulfillment status indicator |

**Impact:** These elements will not respect the global `--radius` theme setting

---

### Category B: Dynamic CVA Variant Mappings ✓
**Action:** Keep as-is  
**Reason:** These are intentional preset mappings for user-selectable border radius values

#### app/sections/image-with-text/image.tsx
- **Lines 28-32:** Border radius variant mapping
  ```javascript
  borderRadius: {
    0: "",                    // 0px
    2: "rounded-xs",          // 2px
    4: "rounded-sm",          // 4px
    6: "rounded-md",          // 6px
    8: "rounded-lg",          // 8px
    10: "rounded-[10px]",     // 10px
    12: "rounded-xl",         // 12px
    // ... continues
  }
  ```

#### app/sections/video-embed/video.tsx
- **Lines 19-23:** Same pattern as image-with-text
- Maps pixel values (4, 6, 8, 12) to Tailwind radius classes
- Range control: min=0, max=40, step=2

#### app/sections/promotion-grid/item.tsx
- **Lines 39-43:** Border radius variant mapping
- Provides user-selectable rounded corners via range input
- Range control: min=0, max=40, step=2

#### app/sections/image-gallery/image.tsx
- **Lines 23-25:** Border radius variant mapping (subset)
- Range control: min=0, max=24, step=2
- Note: Only goes up to 24px in this component

#### app/sections/featured-collections/collection-items.tsx
- **Lines 40-44:** Border radius variant mapping
- Range control: min=0, max=24, step=2
- Applies to collection item cards

#### app/sections/slideshow/arrows.tsx
- **Line 29:** Arrow button shape variant
  ```javascript
  arrowsShape: {
    square: "",
    rounded: "rounded-md",
    circle: "rounded-full",
  }
  ```
- Maps editor option "rounded" to `rounded-md` class

---

### Category C: Editor Configuration ℹ️
**Action:** Optional - Can improve consistency

| File | Line | Value | Context |
|------|------|-------|---------|
| app/sections/slideshow/index.tsx | 273 | `"rounded-sm"` | Arrow shape option in Weaverse editor UI |
| app/sections/slideshow/index.tsx | 278 | `"rounded-sm"` | Default value for arrows shape |

**Note:** These are option labels in the UI editor, not applied to DOM. Could rename to something more generic like `"rounded"` for better clarity.

---

## Search Patterns Applied

✅ Searched for: `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`  
✅ Excluded: `node_modules`, `.react-router`, files with `rounded-full`  
✅ Scope: `.tsx`, `.ts`, `.jsx`, `.js` files  

---

## Global --radius Context

The project implements a global theme radius system:

**Definition:** `app/weaverse/style.tsx`
```css
--radius: ${radiusBase || 0}px;
```

**Current Usage Locations:**
- `app/components/button.tsx` - Buttons use `rounded-(--radius)`
- `app/components/product-card/index.tsx` - Uses `var(--radius, 0px)`
- `app/components/product/badges.tsx` - Uses `var(--radius, 0px)`
- `app/components/section.tsx` - Uses `var(--radius, 0px)`
- `app/styles/app.css` - Input fields and Shopify buttons reference `--radius`
- `app/sections/columns-with-images/column.tsx` - Uses `rounded-(--radius)`

---

## Recommendations

### Priority 1: Fix Category A (HIGH)
Replace all 8 direct hardcoded values with `rounded-(--radius)` to ensure theme consistency.

**Example conversion:**
```tsx
// Before
<figure className="rounded-sm bg-gray-50 p-6">

// After
<figure className="rounded-(--radius) bg-gray-50 p-6">
```

### Priority 2: Category B (LOW)
No action needed. These dynamic mappings are intentional and working as designed. They provide granular control over border radius for specific components.

### Priority 3: Category C (VERY LOW)
Optional improvement - could rename editor labels from `"rounded-sm"` to `"rounded"` for better semantics, since they're just UI labels.

---

## Files Summary

| File | Direct Issue? | Category | Notes |
|------|---------------|----------|-------|
| app/sections/testimonials/item.tsx | YES | A | Testimonial card figure |
| app/components/product/product-option-values.tsx | YES | A | Radix UI dropdown button |
| app/components/cart/cart-summary.tsx | YES | A | Cart UI - 3 instances |
| app/routes/account/orders/list.tsx | YES | A | Order status badges - 2 instances |
| app/sections/image-with-text/image.tsx | NO | B | Dynamic variants (intentional) |
| app/sections/video-embed/video.tsx | NO | B | Dynamic variants (intentional) |
| app/sections/promotion-grid/item.tsx | NO | B | Dynamic variants (intentional) |
| app/sections/image-gallery/image.tsx | NO | B | Dynamic variants (intentional) |
| app/sections/featured-collections/collection-items.tsx | NO | B | Dynamic variants (intentional) |
| app/sections/slideshow/index.tsx | NO | C | Editor config (optional) |
| app/sections/slideshow/arrows.tsx | NO | B | Shape variants (intentional) |

---

## Conclusion

The codebase is relatively clean with no `rounded-none` usage. The 8 direct hardcoded values in Category A should be standardized to use the global `--radius` variable for theme consistency. The 20 instances in Categories B and C are either intentional design patterns or non-critical editor labels and can remain as-is.
