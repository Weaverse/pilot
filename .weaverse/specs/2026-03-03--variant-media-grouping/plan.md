# Variant Media Grouping — Implementation Plan

## 1. Problem Statement

Currently, the product page displays **all** product media regardless of the selected variant. When a visitor selects a color variant (e.g., "Black"), they still see images for every color. This creates a noisy experience, especially for products with many color variants and images.

**Goal**: When a visitor selects a variant option value (e.g., Color = "Black"), filter the displayed media to show only images associated with that option value, plus any shared/ungrouped media.

---

## 2. Requirements

### Functional

- **R1**: Filter product media based on the selected variant's option value for a configurable option name (e.g., "Color").
- **R2**: Merchant can toggle the feature on/off via a Weaverse section setting ("Group media by variant"). Off by default.
- **R3**: Merchant can configure which product option name drives media grouping via a Weaverse text input (default: "Color").
- **R4**: Media not matching any variant image URL are treated as "shared" and always appended after grouped media.
- **R5**: If no media match the selected variant (e.g., feature enabled but no variant images assigned), fall back to showing all media.
- **R6**: Works in both `main-product` and `single-product` sections.
- **R7**: Works with both "grid" and "slider" media layouts.
- **R8**: The zoom modal receives the same filtered media set.

### Non-Functional

- **NR1**: No additional GraphQL queries — use existing data (`ProductVariantFragment.image`, `adjacentVariants`, `product.options`).
- **NR2**: No `useMemo`/`useCallback` (React 19 compiler handles optimization).
- **NR3**: Follow existing code conventions (`cn()`, `cva`, function declarations, named exports).

---

## 3. Technical Approach

### 3.1 Data Available (No GraphQL Changes Needed)

The existing `PRODUCT_QUERY` already provides everything we need:

- **`product.options`** → Array of `{ name, optionValues: [{ name, firstSelectableVariant }] }`.
  Each `firstSelectableVariant` has `image: { url }` and `selectedOptions: [{ name, value }]`.
- **`product.adjacentVariants`** → Array of `ProductVariantFragment`, each with `image: { url }` and `selectedOptions`.
- **`product.selectedOrFirstAvailableVariant`** → The currently selected variant with `image` and `selectedOptions`.
- **`product.media.nodes`** → All product media with `previewImage: { url }`.

### 3.2 Grouping Algorithm

```
Input:
  - allMedia: MediaFragment[]              (product.media.nodes)
  - selectedVariant: ProductVariantFragment (the currently selected variant)
  - product: ProductQuery["product"]       (full product object)
  - groupByOption: string                  (e.g., "Color")

Steps:
  1. Find the selected option value for the grouping option:
     selectedOptionValue = selectedVariant.selectedOptions
       .find(opt => opt.name === groupByOption)?.value

  2. If no selectedOptionValue found, return allMedia (fallback).

  3. Get all known option values from product.options for the grouping option.

  4. For each media item, extract option value from filename using
     delimiter-based matching (_, -) against known option values.
     e.g., "24b_xxx_black.jpg" with options ["Black", "Cream"] → "black"

     Matching covers: start, middle, and end of filename with delimiters,
     plus exact end match. Does NOT cover values with no delimiters in the
     middle of the filename. Adjust conditions if needed.

  5. Group media into matched (matching selected option value) and ungrouped.

  6. If matched is empty → return allMedia (graceful fallback).

  7. Return [...matched, ...ungrouped]

Output:
  - Filtered & ordered MediaFragment[]
```

### 3.3 Where the Logic Lives

Create a **new utility function** `getVariantGroupedMedia()` in a new file `app/utils/variant-media.ts`. This keeps the grouping logic pure, testable, and shared between both product sections.

### 3.4 Component Changes

**`ProductMedia` component** (`app/components/product/product-media.tsx`):
- Add two new props: `groupMediaByVariant: boolean` and `groupByOption: string`.
- Add a new prop: `product` (the full product object, needed to access `options` and `adjacentVariants`).
- When `groupMediaByVariant` is true, call `getVariantGroupedMedia()` to compute the filtered media before rendering.
- The filtered media is passed to both the grid/slider rendering AND the `ZoomModal`.

**`main-product` section** (`app/sections/main-product/index.tsx`):
- Add two new Weaverse schema settings: `groupMediaByVariant` (switch, default false) and `groupByOption` (text, default "Color").
- Pass these new props + the `product` object to `ProductMedia`.

**`single-product` section** (`app/sections/single-product/index.tsx`):
- Same schema settings and prop passing as `main-product`.

---

## 4. Implementation Structure

### 4.1 New Files

| File | Purpose |
|------|---------|
| `app/utils/variant-media.ts` | Pure utility: `getVariantGroupedMedia()` function |

### 4.2 Modified Files

| File | Changes |
|------|---------|
| `app/components/product/product-media.tsx` | Add `groupMediaByVariant`, `groupByOption`, `product` props; call grouping utility; pass filtered media to grid/slider/zoom |
| `app/sections/main-product/index.tsx` | Add Weaverse schema settings; pass new props to `ProductMedia` |
| `app/sections/single-product/index.tsx` | Add Weaverse schema settings; pass new props to `ProductMedia` |

### 4.3 Unchanged Files

| File | Reason |
|------|--------|
| `app/graphql/fragments.ts` | No new GraphQL fields needed |
| `app/graphql/queries.ts` | No query changes needed |
| `app/routes/products/product.tsx` | No loader changes needed |
| `app/weaverse/components.ts` | No new sections to register |
| `app/components/product/media-zoom.tsx` | Receives already-filtered `media` prop — no changes |

---

## 5. Detailed File-by-File Plan

### 5.1 `app/utils/variant-media.ts` (NEW)

```
Export function getVariantGroupedMedia(params):
  params: {
    allMedia: MediaFragment[]
    selectedVariant: ProductVariantFragment
    product: ProductQuery["product"]   // need options + adjacentVariants
    groupByOption: string              // e.g. "Color"
  }
  returns: MediaFragment[]

Logic:
  1. Extract selected option value from selectedVariant.selectedOptions
  2. Guard: if no option value found → return allMedia
  3. Build Set<string> of variant image URLs:
     a. From selectedVariant.image?.url
     b. From product.options → find matching option → iterate optionValues
        → for each where name matches selectedOptionValue,
          collect firstSelectableVariant.image?.url
     c. From product.adjacentVariants → filter by matching selectedOptions
        → collect image?.url
     d. Deduplicate via Set, filter out undefined/null
  4. Partition allMedia: matched vs unmatched (compare previewImage?.url)
  5. If matched is empty → return allMedia (graceful fallback)
  6. Return [...matched, ...unmatched]
```

Type imports needed:
- `MediaFragment`, `ProductVariantFragment` from `storefront-api.generated`
- `ProductQuery` from `storefront-api.generated`

### 5.2 `app/components/product/product-media.tsx` (MODIFY)

**Interface changes** to `ProductMediaProps`:
```
Add:
  groupMediaByVariant?: boolean   // default false
  groupByOption?: string          // default "Color"
  product?: ProductQuery["product"]  // needed for grouping data
```

**Logic changes** in `ProductMedia` function body:
```
After destructuring props, before any rendering:

  let displayMedia = media;
  if (groupMediaByVariant && product && groupByOption) {
    displayMedia = getVariantGroupedMedia({
      allMedia: media,
      selectedVariant,
      product,
      groupByOption,
    });
  }

Then replace all references to `media` with `displayMedia` in:
  - Grid layout: map over displayMedia
  - Slider layout: map over displayMedia (both main swiper and thumbnail swiper)
  - ZoomModal: pass displayMedia instead of media
  - getSelectedVariantMediaIndex: pass displayMedia
```

**Note**: The `useEffect` for sliding to variant image index should use `displayMedia` for the index lookup, so when variant changes it slides to the correct position in the filtered set.

### 5.3 `app/sections/main-product/index.tsx` (MODIFY)

**Destructure new props** from `props`:
```
Add to destructured props:
  groupMediaByVariant,
  groupByOption,
```

**Pass to ProductMedia**:
```
<ProductMedia
  ...existing props...
  groupMediaByVariant={groupMediaByVariant}
  groupByOption={groupByOption}
  product={product}              // already available via useLoaderData
/>
```

**Update `ProductInformationData` interface**:
```
Add:
  groupMediaByVariant?: boolean
  groupByOption?: string
```

**Add Weaverse schema settings** in the "Product Media" group:
```
{
  label: "Group media by variant",
  name: "groupMediaByVariant",
  type: "switch",
  defaultValue: false,
  helpText: "When enabled, only images matching the selected variant option will be displayed"
},
{
  type: "text",
  name: "groupByOption",
  label: "Group by option name",
  defaultValue: "Color",
  placeholder: "Color",
  helpText: "The product option name used to group media (e.g., Color, Colour)",
  condition: (data) => data.groupMediaByVariant === true,
}
```

### 5.4 `app/sections/single-product/index.tsx` (MODIFY)

**Add to `SingleProductData` interface**:
```
  groupMediaByVariant?: boolean
  groupByOption?: string
```

**Destructure and pass to ProductMedia**:
```
// In destructuring:
const { ..., groupMediaByVariant, groupByOption, ...rest } = props;

// In ProductMedia:
<ProductMedia
  ...existing props...
  groupMediaByVariant={groupMediaByVariant}
  groupByOption={groupByOption}
  product={product}              // already available from loaderData
/>
```

**Note**: The `single-product` section manages its own `selectedVariant` state (not via URL). The `product` object from `loaderData` contains `options` and `adjacentVariants`, which is what `getVariantGroupedMedia` needs. However, `adjacentVariants` are scoped to `selectedOptions` passed in the query. Since `single-product` uses `selectedOptions: []` in its query, `adjacentVariants` may be empty. We should primarily rely on `product.options[].optionValues[].firstSelectableVariant.image` for this section, which is always populated.

**Add Weaverse schema settings** in the "Product Media" group:
```
Same two settings as main-product:
  - groupMediaByVariant (switch, default false)
  - groupByOption (text, default "Color", conditional on toggle)
```

---

## 6. Edge Cases

| Edge Case | Handling |
|-----------|----------|
| Product has only 1 variant (default variant) | `hasOnlyDefaultVariant` check in variant selector hides options. No option selected → grouping returns all media. |
| Product has no images assigned to variants | `matched` array is empty → fallback returns all media. |
| Grouping option name doesn't exist on product | `selectedOptionValue` is undefined → fallback returns all media. |
| Combined listing product | Combined listings use `featuredImage` prepended to media. Grouping still works — the featured image won't match any variant URL, so it appears as "unmatched" (shared) media appended after grouped images. This may need review — consider prepending featured image before matched instead. |
| Videos and 3D models | These media types don't have variant image assignments. They'll be treated as unmatched/shared and always shown. |
| Variant image URL comparison | Shopify CDN URLs may have different query parameters. Compare using URL pathname only (strip query params). |
| Single-product section: adjacentVariants empty | Rely on `product.options[].optionValues[].firstSelectableVariant.image` instead. The utility handles both data sources. |

---

## 7. Filename Matching Strategy

Media is grouped by extracting option values from image filenames using delimiter-based pattern matching (`_`, `-`). The matching checks for the option value at the start, middle, or end of the filename, bounded by delimiters.

```
Covered patterns (e.g., option value "black"):
  black_xxx.jpg       (start + _)
  black-xxx.jpg       (start + -)
  xxx_black.jpg       (end + _)
  xxx-black.jpg       (end + -)
  xxx_black_yyy.jpg   (middle + _)
  xxx-black-yyy.jpg   (middle + -)
  xxxblack.jpg        (end, no delimiter)

NOT covered:
  xxxblackyyy.jpg     (middle, no delimiters)
```

This is intentionally conservative to avoid false positives with short option values (e.g., "red" matching "featured").

---

## 8. Weaverse Settings UX

The settings appear in the "Product Media" group in both sections:

```
[ Product Media ]
  Aspect ratio: [Adapt to image ▾]
  Layout: [Grid] [Slider]
  Grid size: [2x2 ▾]                    (conditional: grid layout)
  Show thumbnails: [toggle]             (conditional: slider layout)
  ─────────────────────────────
  Group media by variant: [toggle OFF]  ← NEW
  Group by option name: [Color]         ← NEW (conditional: toggle ON)
  ─────────────────────────────
  Enable zoom: [toggle]
  Zoom trigger: [Both ▾]               (conditional: zoom enabled)
  Zoom button visibility: [On hover ▾] (conditional: zoom enabled)
```

---

## 9. Implementation Order

1. **Create `app/utils/variant-media.ts`** — Pure utility with `getVariantGroupedMedia()` and `extractOptionValueFromUrl()` (filename-based matching).
2. **Modify `app/components/product/product-media.tsx`** — Add new props, integrate grouping utility.
3. **Modify `app/sections/main-product/index.tsx`** — Add schema settings, pass props.
4. **Modify `app/sections/single-product/index.tsx`** — Add schema settings, pass props.
5. **Run `npm run typecheck`** — Verify no type errors.
6. **Run `npm run biome:fix`** — Ensure formatting/linting compliance.
7. **Manual QA** — Test with products that have variant images assigned and products that don't.

---

## 10. Testing Checklist

- [ ] Toggle OFF (default): All media display as before — no regressions.
- [ ] Toggle ON, product with variant images: Only matching images + shared media shown.
- [ ] Toggle ON, product without variant images: Falls back to showing all media.
- [ ] Toggle ON, select different color: Media set updates immediately.
- [ ] Grid layout: Correct media displayed.
- [ ] Slider layout: Correct media + thumbnails displayed, correct slide index.
- [ ] Zoom modal: Shows only the filtered media set.
- [ ] Single-product section: Same behavior as main-product.
- [ ] Combined listing: Featured image appears as shared media.
- [ ] Product with only default variant: All media shown (no grouping option to match).
- [ ] Videos/3D models: Always shown as shared media.
- [ ] Weaverse Studio: Settings render correctly with conditions.

---

## 11. Files Touched Summary

| File | Action | Lines (est.) |
|------|--------|-------------|
| `app/utils/variant-media.ts` | **CREATE** | ~60 |
| `app/components/product/product-media.tsx` | **MODIFY** | ~15 changed |
| `app/sections/main-product/index.tsx` | **MODIFY** | ~25 added |
| `app/sections/single-product/index.tsx` | **MODIFY** | ~25 added |
| **Total** | | ~125 lines |

---

## 12. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Filename convention mismatch | Medium | Low | Delimiter-based matching covers common patterns; merchants can adjust conditions in `extractOptionValueFromUrl()` |
| Merchant sets wrong option name | Medium | Low | Graceful fallback to showing all media |
| Performance with many variants | Low | Low | Simple Set lookups + array partition — O(n) |
| Combined listing edge cases | Medium | Medium | Test with combined listing products; may need special handling for featured image position |
| `adjacentVariants` data scoping | Medium | Low | Primary reliance on `product.options` data which is always fully populated |
