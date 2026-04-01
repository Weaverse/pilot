# Hardcoded Radius Values - Detailed Code References

## Category A: Direct Hardcoded Values (Requires Action)

### 1. app/sections/testimonials/item.tsx:39
```tsx
<figure className="rounded-sm bg-gray-50 p-6">
  <blockquote>
    <div className="text-xl md:text-2xl">{heading}</div>
    // ... content
  </blockquote>
</figure>
```
**Should be:** `rounded-(--radius) bg-gray-50 p-6`  
**Element:** Figure card container for testimonial  
**Severity:** MEDIUM - Visual component that should respect theme radius

---

### 2. app/components/product/product-option-values.tsx:100
```tsx
<Select.ScrollDownButton className="flex cursor-pointer items-center justify-center rounded-lg hover:bg-info-100 dark:hover:bg-info-700">
  <CaretDownIcon size={16} />
</Select.ScrollDownButton>
```
**Should be:** `rounded-(--radius)` instead of `rounded-lg`  
**Element:** Radix UI Select scroll down button  
**Severity:** MEDIUM - Dropdown component should be theme-consistent

---

### 3. app/components/cart/cart-summary.tsx:61
```tsx
<div
  className={clsx(
    layout === "drawer" && "grid border-line-subtle border-t pt-4",
    layout === "page" &&
      "sticky top-(--height-nav) grid w-full rounded-sm py-4 md:translate-y-4 md:px-6 lg:py-0",
  )}
>
```
**Should be:** `rounded-(--radius)` instead of `rounded-sm`  
**Element:** Sticky cart summary container on page layout  
**Severity:** HIGH - Main layout component

---

### 4. app/components/cart/cart-summary.tsx:77
```tsx
<div
  key={giftCard.id}
  className="flex items-center justify-center gap-2 rounded-md bg-gray-200 px-2 py-1.5 [&>form]:flex"
>
  <GiftIcon className="h-4.5 w-4.5" aria-hidden="true" />
  // ... gift card display
</div>
```
**Should be:** `rounded-(--radius)` instead of `rounded-md`  
**Element:** Gift card badge  
**Severity:** MEDIUM - Badge/chip component

---

### 5. app/components/cart/cart-summary.tsx:134
```tsx
<div
  key={discount.code}
  className="flex items-center justify-center gap-2 rounded-md bg-gray-200 px-2 py-1.5 [&>form]:flex"
>
  <TagIcon className="h-4.5 w-4.5" aria-hidden="true" />
  // ... discount code display
</div>
```
**Should be:** `rounded-(--radius)` instead of `rounded-md`  
**Element:** Discount code badge  
**Severity:** MEDIUM - Badge/chip component

---

### 6. app/routes/account/orders/list.tsx:189
```tsx
<span className="rounded-md bg-gray-500 px-2 py-1 text-white">
  {order.financialStatus}
</span>
```
**Should be:** `rounded-(--radius)` instead of `rounded-md`  
**Element:** Financial status badge  
**Severity:** MEDIUM - Order status indicator

---

### 7. app/routes/account/orders/list.tsx:193
```tsx
{fulfillmentStatus && (
  <span className="rounded-md bg-gray-500 px-2 py-1 text-white">
    {fulfillmentStatus}
  </span>
)}
```
**Should be:** `rounded-(--radius)` instead of `rounded-md`  
**Element:** Fulfillment status badge  
**Severity:** MEDIUM - Order status indicator

---

## Category B: Dynamic CVA Variant Mappings (Keep As-Is)

### 1. app/sections/image-with-text/image.tsx:28-32
```tsx
const variants = cva("h-auto w-full", {
  variants: {
    // ... other variants
    borderRadius: {
      0: "",                    // No border radius
      2: "rounded-xs",          // 2px
      4: "rounded-sm",          // 4px  ← Line 28
      6: "rounded-md",          // 6px  ← Line 29
      8: "rounded-lg",          // 8px  ← Line 30
      10: "rounded-[10px]",     // 10px
      12: "rounded-xl",         // 12px ← Line 32
      14: "rounded-[14px]",
      16: "rounded-2xl",
      18: "rounded-[18px]",
      20: "rounded-[20px]",
      22: "rounded-[22px]",
      24: "rounded-3xl",
      26: "rounded-[26px]",
      28: "rounded-[28px]",
      30: "rounded-[30px]",
      32: "rounded-[32px]",
      34: "rounded-[34px]",
      36: "rounded-[36px]",
      38: "rounded-[38px]",
      40: "rounded-[40px]",
    },
  },
});
```
**Context:** User selects border radius via range input (0-40px, step 2)  
**Status:** INTENTIONAL - Fine-grained control for images  
**Keep:** YES

---

### 2. app/sections/video-embed/video.tsx:19-23
```tsx
const variants = cva("mx-auto aspect-video w-full", {
  variants: {
    // ... size variants
    borderRadius: {
      0: "",                    // No border radius
      2: "rounded-xs",          // 2px
      4: "rounded-sm",          // 4px  ← Line 19
      6: "rounded-md",          // 6px  ← Line 20
      8: "rounded-lg",          // 8px  ← Line 21
      10: "rounded-[10px]",     // 10px
      12: "rounded-xl",         // 12px ← Line 23
      14: "rounded-[14px]",
      16: "rounded-2xl",
      18: "rounded-[18px]",
      20: "rounded-[20px]",
      22: "rounded-[22px]",
      24: "rounded-3xl",
      26: "rounded-[26px]",
      28: "rounded-[28px]",
      30: "rounded-[30px]",
      32: "rounded-[32px]",
      34: "rounded-[34px]",
      36: "rounded-[36px]",
      38: "rounded-[38px]",
      40: "rounded-[40px]",
    },
  },
  defaultVariants: {
    size: "medium",
    borderRadius: 0,
  },
});
```
**Context:** User selects border radius via range input (0-40px, step 2)  
**Status:** INTENTIONAL - Fine-grained control for videos  
**Keep:** YES

---

### 3. app/sections/promotion-grid/item.tsx:39-43
```tsx
const variants = cva(
  [
    "promotion-grid-item",
    "group/overlay",
    "relative flex aspect-square flex-col gap-4 overflow-hidden p-4",
    "[&_.paragraph]:mx-[unset]",
  ],
  {
    variants: {
      contentPosition: { /* ... */ },
      borderRadius: {
        0: "",                    // No border radius
        2: "rounded-xs",          // 2px
        4: "rounded-sm",          // 4px  ← Line 39
        6: "rounded-md",          // 6px  ← Line 40
        8: "rounded-lg",          // 8px  ← Line 41
        10: "rounded-[10px]",     // 10px
        12: "rounded-xl",         // 12px ← Line 43
        14: "rounded-[14px]",
        16: "rounded-2xl",
        18: "rounded-[18px]",
        20: "rounded-[20px]",
        22: "rounded-[22px]",
        24: "rounded-3xl",
        26: "rounded-[26px]",
        28: "rounded-[28px]",
        30: "rounded-[30px]",
        32: "rounded-[32px]",
        34: "rounded-[34px]",
        36: "rounded-[36px]",
        38: "rounded-[38px]",
        40: "rounded-[40px]",
      },
    },
  },
);
```
**Context:** User selects border radius via range input (0-40px, step 2)  
**Status:** INTENTIONAL - Fine-grained control for promotion grid  
**Keep:** YES

---

### 4. app/sections/image-gallery/image.tsx:23-25
```tsx
const variants = cva("h-(--image-height)", {
  variants: {
    columnSpan: { /* ... */ },
    borderRadius: {
      0: "",                    // No border radius
      2: "rounded-xs",          // 2px
      4: "rounded-sm",          // 4px  ← Line 23
      6: "rounded-md",          // 6px  ← Line 24
      8: "rounded-lg",          // 8px  ← Line 25
      10: "rounded-[10px]",
      12: "rounded-xl",
      14: "rounded-[14px]",
      16: "rounded-2xl",
      18: "rounded-[18px]",
      20: "rounded-[20px]",
      22: "rounded-[22px]",
      24: "rounded-3xl",
    },
    hideOnMobile: { /* ... */ },
  },
  defaultVariants: {
    columnSpan: 1,
    borderRadius: 8,
    hideOnMobile: false,
  },
});
```
**Context:** User selects border radius via range input (0-24px, step 2)  
**Status:** INTENTIONAL - Fine-grained control for gallery  
**Keep:** YES

---

### 5. app/sections/featured-collections/collection-items.tsx:40-44
```tsx
const variants = cva("", {
  variants: {
    gridSize: { /* ... */ },
    gap: { /* ... */ },
    borderRadius: {
      0: "",                    // No border radius
      2: "rounded-xs",          // 2px
      4: "rounded-sm",          // 4px  ← Line 40
      6: "rounded-md",          // 6px  ← Line 41
      8: "rounded-lg",          // 8px  ← Line 42
      10: "rounded-[10px]",     // 10px
      12: "rounded-xl",         // 12px ← Line 44
      14: "rounded-[14px]",
      16: "rounded-2xl",
      18: "rounded-[18px]",
      20: "rounded-[20px]",
      22: "rounded-[22px]",
      24: "rounded-3xl",
    },
    contentPosition: { /* ... */ },
  },
});
```
**Context:** User selects border radius via range input (0-24px, step 2)  
**Status:** INTENTIONAL - Fine-grained control for collection cards  
**Keep:** YES

---

### 6. app/sections/slideshow/arrows.tsx:29
```tsx
const variants = cva(
  [
    "hidden md:block",
    "-translate-y-1/2 absolute top-1/2 z-1",
    "cursor-pointer p-2 text-center",
    "border border-transparent",
    "transition-all duration-200",
  ],
  {
    variants: {
      arrowsColor: { /* ... */ },
      arrowsShape: {
        square: "",
        rounded: "rounded-md",    // ← Line 29
        circle: "rounded-full",
      },
      disabled: { /* ... */ },
      showArrowsOnHover: { /* ... */ },
      side: { /* ... */ },
    },
    // ... compound variants
  },
);
```
**Context:** Maps editor option "rounded" shape to `rounded-md`  
**Status:** INTENTIONAL - Shape selection for arrow buttons  
**Keep:** YES

---

## Category C: Editor Configuration (Optional)

### 1. app/sections/slideshow/index.tsx:273
```tsx
{
  type: "toggle-group",
  label: "Arrows shape",
  name: "arrowsShape",
  configs: {
    options: [
      { value: "rounded-sm", label: "Rounded", icon: "squircle" },  // ← Line 273
      { value: "circle", label: "Circle", icon: "circle" },
      { value: "square", label: "Square", icon: "square" },
    ],
  },
  defaultValue: "rounded-sm",
  condition: (data: SlideshowData) => data.showArrows,
}
```
**Context:** Weaverse editor UI option value  
**Status:** OPTIONAL - These are labels shown in editor, not applied to DOM  
**Recommendation:** Could rename `"rounded-sm"` to `"rounded"` for better semantics

---

### 2. app/sections/slideshow/index.tsx:278
```tsx
{
  type: "toggle-group",
  label: "Arrows shape",
  name: "arrowsShape",
  configs: {
    options: [
      { value: "rounded-sm", label: "Rounded", icon: "squircle" },
      { value: "circle", label: "Circle", icon: "circle" },
      { value: "square", label: "Square", icon: "square" },
    ],
  },
  defaultValue: "rounded-sm",  // ← Line 278
  condition: (data: SlideshowData) => data.showArrows,
}
```
**Context:** Default value for arrows shape option  
**Status:** OPTIONAL - Part of editor configuration  
**Recommendation:** Could rename `"rounded-sm"` to `"rounded"` for consistency

---

## Summary Statistics

| Category | Count | File Count | Action |
|----------|-------|------------|--------|
| A - Direct Hardcoded | 8 | 4 | ✅ REPLACE with `rounded-(--radius)` |
| B - Dynamic Mappings | 20 | 6 | ℹ️ KEEP AS-IS (intentional) |
| C - Editor Config | 2 | 1 | 🔧 OPTIONAL (improve semantics) |
| **TOTAL** | **30** | **11** | |

**No `rounded-none` found:** ✅

---

## Implementation Notes

### For Category A Fixes:
Use consistent approach across all 8 instances:
```tsx
// Pattern: Replace hardcoded rounded-{size} with rounded-(--radius)
className="rounded-(--radius) [other-classes]"

// Falls back to 0px if --radius not defined
// Example from existing code:
className={cn(
  "relative inline-flex items-center justify-center rounded-(--radius)",
  // ... other classes
)}
```

### Global --radius Reference:
- Defined in: `app/weaverse/style.tsx`
- Already used in: `app/components/button.tsx`, `app/sections/columns-with-images/column.tsx`
- Format: `--radius: ${radiusBase || 0}px`
