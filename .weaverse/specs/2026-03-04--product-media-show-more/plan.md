# Product Media "Show More" — Implementation Plan

## Summary

Limit visible media in the product grid layout to a configurable count, with a "Show more" button to reveal the rest and a "Show less" button to collapse back. Applies **after** variant media grouping. Grid layout on main product page only — slider layout is unaffected.

---

## Requirements

### Functional Requirements

- [ ] FR1: Merchant can configure `initialMediaCount` (number) in Weaverse Studio under "Product Media" settings
- [ ] FR2: When `mediaLayout === "grid"` and `displayMedia.length > initialMediaCount`, only the first N items render initially
- [ ] FR3: A "Show more" button appears after the visible media grid, showing remaining count (e.g., "+5 more")
- [ ] FR4: Clicking "Show more" reveals ALL remaining media at once
- [ ] FR5: After expanding, a "Show less" button appears to collapse back to `initialMediaCount`
- [ ] FR6: Button text for "Show more" and "Show less" is customizable in Weaverse Studio
- [ ] FR7: The last-row-span-full logic (existing) still applies to whichever set of media is currently visible
- [ ] FR8: Variant changes reset the expanded state back to collapsed (since `displayMedia` recomputes)
- [ ] FR9: The `initialMediaCount` setting only appears when `mediaLayout === "grid"` (conditional visibility)
- [ ] FR10: If `initialMediaCount` is 0 or >= total media count, show all media (no button)
- [ ] FR11: Slider layout is completely unaffected
- [ ] FR12: The zoom modal still receives the FULL `displayMedia` array (not sliced), so zoom navigation works across all media

### Non-Functional Requirements

- [ ] NFR1: No layout shift when expanding — the button sits below the grid, new items append naturally
- [ ] NFR2: No new dependencies — use existing React state + Tailwind classes
- [ ] NFR3: Accessible — button has descriptive aria-label

### Out of Scope

- Infinite scroll / lazy loading of media
- "Show more" for slider layout
- Animation/transition on expand (can be added later)
- Single product section (`single-product`) — main product page only

---

## Technical Approach

### Solution Overview

Add an `expanded` boolean state to `ProductMedia`. When `mediaLayout === "grid"` and media count exceeds `initialMediaCount`, slice `displayMedia` to show only the first N items. Render a toggle button below the grid. The slice happens **after** variant grouping, so variant-specific media is correctly filtered first.

### Data Flow

```
media (all product media)
  → getVariantGroupedMedia() → displayMedia (filtered by variant)
    → slice(0, initialMediaCount) → visibleMedia (what renders in grid)
      → "Show more" button shows (displayMedia.length - initialMediaCount) remaining
        → click → expanded=true → visibleMedia = displayMedia (full)
          → "Show less" → expanded=false → back to slice
```

### Key Decisions

1. **Slice AFTER variant grouping** — ensures "show more" count reflects variant-specific media, not all media
2. **Reset on variant change** — `expanded` resets to `false` when `selectedVariant` changes, because `displayMedia` recomputes and the count may change
3. **Zoom gets full array** — `ZoomModal` always receives the complete `displayMedia`, so users can navigate all images in zoom even when grid is collapsed
4. **Last-row span logic applies to visible slice** — the `isLast` check operates on `visibleMedia`, so the last visible item spans full width correctly

---

## Implementation Structure

### Files to Modify

| File | Changes |
|------|---------|
| `app/components/product/product-media.tsx` | Add `initialMediaCount`, `showMoreText`, `showLessText` to `ProductMediaProps`. Add `expanded` state. Slice `displayMedia` for grid rendering. Add toggle button below grid. Reset `expanded` on variant change. |
| `app/sections/main-product/index.tsx` | Add `initialMediaCount`, `showMoreText`, `showLessText` to destructured props, pass to `<ProductMedia>`. Add 3 new schema inputs under "Product Media" group with `condition: mediaLayout === "grid"`. |

### No New Files

This feature is fully contained in existing files — no new components, utils, or types needed.

---

## Detailed Changes

### 1. `app/components/product/product-media.tsx`

#### Props additions:

```typescript
export interface ProductMediaProps extends VariantProps<typeof variants> {
  // ... existing props
  initialMediaCount?: number;    // 0 = show all (default)
  showMoreText?: string;         // default: "Show more"
  showLessText?: string;         // default: "Show less"
}
```

#### State & logic (inside `ProductMedia` function, grid branch only):

```typescript
const [expanded, setExpanded] = useState(false);

// Reset expanded state on variant change
useEffect(() => {
  setExpanded(false);
}, [selectedVariant]);

// Compute visible media for grid
const shouldLimit = mediaLayout === "grid"
  && initialMediaCount > 0
  && displayMedia.length > initialMediaCount;
const visibleMedia = shouldLimit && !expanded
  ? displayMedia.slice(0, initialMediaCount)
  : displayMedia;
const hiddenCount = displayMedia.length - (visibleMedia?.length ?? 0);
```

#### Grid rendering changes:

- Replace `displayMedia.map(...)` with `visibleMedia.map(...)` in the grid branch
- The `isLast` check uses `visibleMedia.length` (so last-row-span still works correctly on visible set)
- `ZoomModal` still receives full `displayMedia` (unchanged)

#### Toggle button (after the grid `<div>`, before `ZoomModal`):

```tsx
{shouldLimit && (
  <button
    type="button"
    className="mt-2 w-full border border-line py-3 text-center text-sm font-medium transition-colors hover:bg-gray-100 lg:mt-1"
    onClick={() => setExpanded((prev) => !prev)}
    aria-label={expanded ? showLessText : `${showMoreText} (+${hiddenCount})`}
  >
    {expanded ? showLessText : `${showMoreText} (+${hiddenCount})`}
  </button>
)}
```

### 2. `app/sections/main-product/index.tsx`

#### Props additions to destructuring:

```typescript
const {
  // ... existing props
  initialMediaCount,
  showMoreText,
  showLessText,
} = props;
```

#### Pass to `<ProductMedia>`:

```tsx
<ProductMedia
  // ... existing props
  initialMediaCount={initialMediaCount}
  showMoreText={showMoreText}
  showLessText={showLessText}
/>
```

#### Schema additions (under "Product Media" group `inputs` array, after `groupByOption`):

```typescript
{
  type: "range",
  name: "initialMediaCount",
  label: "Initial media to show",
  defaultValue: 0,
  configs: {
    min: 0,
    max: 20,
    step: 1,
  },
  helpText: "Number of media items visible before 'Show more'. Set to 0 to show all.",
  condition: (data: ProductInformationData) => data.mediaLayout === "grid",
},
{
  type: "text",
  name: "showMoreText",
  label: "Show more button text",
  defaultValue: "Show more",
  placeholder: "Show more",
  condition: (data: ProductInformationData) =>
    data.mediaLayout === "grid" && (data.initialMediaCount ?? 0) > 0,
},
{
  type: "text",
  name: "showLessText",
  label: "Show less button text",
  defaultValue: "Show less",
  placeholder: "Show less",
  condition: (data: ProductInformationData) =>
    data.mediaLayout === "grid" && (data.initialMediaCount ?? 0) > 0,
},
```

#### Update `ProductInformationData` interface:

```typescript
interface ProductInformationData
  extends Omit<ProductMediaProps, "selectedVariant" | "media" | "product"> {
  ref: React.Ref<HTMLDivElement>;
}
```

No change needed — since `initialMediaCount`, `showMoreText`, `showLessText` are added to `ProductMediaProps`, they're automatically included via the `Omit<>` extension.

---

## Edge Cases

| Case | Behavior |
|------|----------|
| `initialMediaCount = 0` | Show all media, no button (feature disabled) |
| `initialMediaCount >= displayMedia.length` | Show all media, no button |
| `initialMediaCount = 1`, grid = `2x2` | Single item spans full width (existing last-row logic), button below |
| Variant change reduces media below `initialMediaCount` | `expanded` resets, all variant media shown, no button |
| `gridSize = "1x1"` (1 column) | Works normally — each item is full width anyway |
| Single media item | `displayMedia.length === 1` → forces `gridSize = "1x1"`, no button |
| Combined listing with featured image prepended | Works — slice happens after media array is assembled |

---

## Testing Checklist

- [ ] Grid `2x2` with 6 images, `initialMediaCount = 4`: shows 4, button says "+2", click reveals all, "Show less" collapses
- [ ] Grid `mix` with 5 images, `initialMediaCount = 3`: shows 3 (first spans full + 2 half), button shows "+2"
- [ ] Grid `1x1` with 4 images, `initialMediaCount = 2`: shows 2, button shows "+2"
- [ ] `initialMediaCount = 0`: all media shown, no button
- [ ] `initialMediaCount = 10`, only 3 images: all shown, no button
- [ ] Variant grouping enabled: switch variant → media refilters, expanded resets, count updates
- [ ] Zoom modal opens from collapsed state → can navigate ALL media (not just visible)
- [ ] Slider layout: completely unaffected regardless of `initialMediaCount` value
- [ ] Last-row-span-full works correctly on the visible slice boundary
- [ ] Button text customization works in Weaverse Studio
