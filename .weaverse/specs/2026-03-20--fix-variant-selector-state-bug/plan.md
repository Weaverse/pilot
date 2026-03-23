# Plan: Fix VariantSelector State Bug

## Problem

Two code paths exist in `ProductOptionValues` (`product-option-values.tsx`, line 180-185):

```typescript
onClick: () => {
  if (onVariantChange && firstSelectableVariant) {
    onVariantChange(firstSelectableVariant);        // ← BUG: ignores other selected options
  } else if (!selected && exists) {
    navigate(to, { replace: true });                // ← WORKS: variantUriQuery has full combo
  }
},
```

**Why it breaks:** `firstSelectableVariant` is the first variant in the Storefront API that has a given option value (e.g., Size=L). It does NOT consider other selected options (e.g., Color=Blue). So clicking Size "L" while Color "Blue" is selected gives you **Red/L** instead of **Blue/L**.

**Why main-product works:** It does NOT pass `onVariantChange`, so the `navigate(to)` path runs. `variantUriQuery` is built by `getProductOptions()` and encodes the full option combination (e.g., `Color=Blue&Size=L`). URL change triggers `useOptimisticVariant` which resolves the correct variant.

## Debug findings (confirmed via `debug-logs.json`)

Product tested: `soft-jersey-classic-fit-hoodie` (2 colors: Black, Rose Blush × 5 sizes: XS, S, M, L, XL)

**Key data points after selecting Rose Blush:**
- `adjacentVariants` (5 total): Rose Blush/XS + Black/S, M, L, XL — **no Rose Blush/S, M, L, XL**
- `firstSelectableVariant` for Size S/M/L/XL: all **Black** — hardcoded by Storefront API
- `mappedOptions.Size[*].variant`: all **Black** — because `getProductOptions()` can't find Rose Blush sizes in the stale adjacentVariants cache, falls back to `firstSelectableVariant`
- `mappedOptions.Size[*].variantUriQuery`: all `Color=Black&Size=*` — built from the wrong `.variant`

**Conclusion:** Both `variant` and `firstSelectableVariant` are wrong. The adjacentVariants pool is insufficient because the product was loaded with `selectedOptions: []` and never refetched. We need all variants.

## Solution: Client-side product + variants fetch via shared API route

Both the **single-product section** and **quick-shop modal** will fetch product data (including all variants) client-side via the existing `/api/product/:handle` route. This approach:

1. **Improves performance** — removes the server-side Weaverse `loader` from single-product section, reducing TTFB on pages where this section appears (e.g., homepage)
2. **Unifies the pattern** — both consumers fetch from `/api/product/:handle` client-side
3. **Provides all variants** — the API route returns the full variants list for client-side lookup
4. **Doesn't touch main product page** — `PRODUCT_QUERY` and URL-based navigation are unchanged

### Why client-side for single-product
- Single-product sections are typically placed below the fold (homepage featured products, landing pages)
- Server-side fetch blocks TTFB for content users haven't scrolled to yet
- The product has its own canonical `/products/:handle` page for SEO — the section is promotional, not the canonical source
- For a starter theme, better Lighthouse scores impress clients
- Uses `IntersectionObserver` (via `react-intersection-observer`, already in the codebase) to defer fetch until the section is in view — avoids wasting bandwidth if user never scrolls there
- Shows a skeleton loading state (like quick-shop) while data loads

### Why NOT touch `PRODUCT_QUERY`
- Used by the main product page route which works correctly via URL navigation
- Adding `variants(first: 250)` there would degrade performance for a page that doesn't need it
- Keep the fix surgical and side-effect free

## Implementation Steps

### Step 1: Create a new variants-only GraphQL query

**File:** `app/graphql/queries.ts`

```graphql
query ProductVariants($handle: String!, $language: LanguageCode, $country: CountryCode)
  @inContext(language: $language, country: $country) {
  product(handle: $handle) {
    variants(first: 250) {
      nodes {
        ...ProductVariant
      }
    }
  }
}
```

Reuses the existing `PRODUCT_VARIANT_FRAGMENT` so the returned variant shape matches `ProductVariantFragment` exactly.

### Step 2: Update the product API route to include variants

**File:** `app/routes/api/product.ts`

Add `PRODUCT_VARIANTS_QUERY` in parallel alongside the existing `PRODUCT_QUERY`:

```typescript
const [result, variantsResult] = await Promise.all([
  storefront.query<ProductQuery>(PRODUCT_QUERY, {
    variables: {
      handle: productHandle,
      selectedOptions: [],
      language: storefront.i18n.language,
      country: storefront.i18n.country,
    },
  }),
  storefront.query(PRODUCT_VARIANTS_QUERY, {
    variables: {
      handle: productHandle,
      language: storefront.i18n.language,
      country: storefront.i18n.country,
    },
  }),
]);

return data({
  product: result.product,
  variants: variantsResult?.product?.variants?.nodes ?? [],
  storeDomain: result.shop?.primaryDomain?.url || null,
});
```

### Step 3: Convert single-product section to client-side fetch

**File:** `app/sections/single-product/index.tsx`

**Remove** the Weaverse `loader` export entirely. Use native `fetch` + `useInView` from `react-intersection-observer` (already used in the codebase, e.g., `hero-video.tsx`) to load data only when the section scrolls into view. Replace the current static placeholder with a proper skeleton UI (like quick-shop's pattern).

```typescript
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

interface FetchedProductData {
  product: NonNullable<ProductQuery["product"]> | null;
  variants: ProductVariantFragment[];
  storeDomain: string | null;
}

export default function SingleProduct(props: SingleProductProps) {
  const { ref: inViewRef, inView } = useInView({ triggerOnce: true });
  const { product: _product, ...rest } = props;
  const productHandle = _product?.handle;

  const [data, setData] = useState<FetchedProductData | null>(null);

  useEffect(() => {
    if (inView && productHandle && !data) {
      fetch(`/api/product/${productHandle}`)
        .then((res) => res.json())
        .then(setData)
        .catch(console.error);
    }
  }, [inView, productHandle]);

  const product = data?.product;
  const variants = data?.variants ?? [];
  const storeDomain = data?.storeDomain;

  if (!product) {
    // Skeleton loading state (mirrors quick-shop pattern)
    return (
      <Section ref={inViewRef} {...rest}>
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-12">
          <Skeleton className="flex aspect-square items-center justify-center">
            <ImageIcon className="h-16 w-16 text-body-subtle" />
          </Skeleton>
          <div className="flex flex-col justify-start gap-5">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
            <div className="flex gap-3">
              <Skeleton className="h-10 w-14" />
              <Skeleton className="h-10 w-14" />
              <Skeleton className="h-10 w-14" />
            </div>
            <Skeleton className="flex h-12 w-full items-center justify-center">
              <ShoppingCartIcon className="h-5 w-5 text-body-subtle" />
            </Skeleton>
          </div>
        </div>
      </Section>
    );
  }

  // ... rest of component (product loaded)
}
```

**Key details:**
- `useInView({ triggerOnce: true })` — only triggers fetch once when the section enters the viewport
- The `inViewRef` is set on the `<Section>` wrapper so the skeleton itself is the intersection target
- Skeleton layout mirrors the 2-column product grid (image left, details right)
- Native `fetch` with `useState` — simpler than `useFetcher`, no React Router dependency for this pattern
- `triggerOnce: true` prevents re-fetching on scroll in/out

### Step 4: Update `VariantSelector` to accept variants

**File:** `app/components/product/variant-selector.tsx`

Add an optional `variants` prop, build a lookup map, and pass it down:

```typescript
export function VariantSelector({
  product,
  selectedVariant,
  setSelectedVariant,
  variants,
}: {
  product: NonNullable<ProductQuery["product"]>;
  selectedVariant: ProductVariantFragment;
  setSelectedVariant: (variant: ProductVariantFragment) => void;
  variants?: ProductVariantFragment[];
}) {
  // Build variant lookup map
  const variantMap = new Map<string, ProductVariantFragment>();
  if (variants) {
    for (const v of variants) {
      const key = v.selectedOptions
        .map((o) => `${o.name}=${o.value}`)
        .sort()
        .join("&");
      variantMap.set(key, v);
    }
  }

  // ... pass variantMap and selectedVariant.selectedOptions to ProductOptionValues
}
```

### Step 5: Update `ProductOptionValues` onClick to resolve correct variant

**File:** `app/components/product/product-option-values.tsx`

In `OptionValue`, accept `variantMap` and `selectedOptions`. On click, build the target key and look up:

```typescript
onClick: () => {
  if (onVariantChange) {
    let resolvedVariant: ProductVariantFragment | undefined;
    if (variantMap?.size) {
      const targetOptions = selectedOptions.map((o) =>
        o.name === optionName ? { ...o, value: name } : o,
      );
      const key = targetOptions
        .map((o) => `${o.name}=${o.value}`)
        .sort()
        .join("&");
      resolvedVariant = variantMap.get(key);
    }
    const finalVariant = resolvedVariant || firstSelectableVariant;
    if (finalVariant) {
      onVariantChange(finalVariant);
    }
  } else if (!selected && exists) {
    navigate(to, { replace: true });
  }
},
```

### Step 6: Wire up callers

**File:** `app/sections/single-product/index.tsx`

```tsx
<VariantSelector
  product={product}
  selectedVariant={selectedVariant}
  setSelectedVariant={setSelectedVariant}
  variants={variants}
/>
```

**File:** `app/components/product-card/quick-shop.tsx`

```tsx
<VariantSelector
  product={product}
  selectedVariant={selectedVariant}
  setSelectedVariant={setSelectedVariant}
  variants={data.variants}
/>
```

### Step 7: Run codegen

```bash
npm run codegen
```

### Step 8: Remove debug logging

Remove all `_pushLog`, `_summarizeVariant`, and `window.__logs` code from:
- `app/components/product/variant-selector.tsx`
- `app/components/product/product-option-values.tsx`

## Files to Modify

| File | Changes |
|------|---------|
| `app/graphql/queries.ts` | Add `PRODUCT_VARIANTS_QUERY` |
| `app/routes/api/product.ts` | Add variants query in parallel, include `variants` in response |
| `app/sections/single-product/index.tsx` | Remove Weaverse `loader`, use native `fetch` + `useInView` for client-side in-view fetch, replace placeholder with skeleton, pass `variants` to `VariantSelector` |
| `app/components/product/variant-selector.tsx` | Accept `variants` prop, build lookup map, pass to `ProductOptionValues` |
| `app/components/product/product-option-values.tsx` | Accept `variantMap` + `selectedOptions`, resolve correct variant on click |
| `app/components/product-card/quick-shop.tsx` | Pass `data.variants` to `VariantSelector` |

## Files NOT Modified

| File | Role |
|------|------|
| `app/sections/main-product/product-variant-selector.tsx` | Uses URL navigation, unaffected |
| `app/sections/main-product/variants.tsx` | No `onVariantChange`, unaffected |
| `app/graphql/fragments.ts` | Reuses existing `PRODUCT_VARIANT_FRAGMENT` as-is |
| `app/graphql/queries.ts` (`PRODUCT_QUERY`) | Not modified — only new query added |

## Testing Plan

1. **Single-product section:** Select 2nd color → select any size → verify color does NOT jump back
2. **Single-product section:** Verify skeleton renders while data loads, no CLS
3. **Single-product section:** Verify data only loads when section scrolls into view (check Network tab)
4. **Quick-shop modal:** Same variant test as #1
5. **Main product page:** Verify existing URL-based flow still works unchanged
6. **Edge cases:**
   - Product with 1 option only
   - Product with 3+ options (Color, Size, Material)
   - Out-of-stock variant combinations
   - Products with only default variant (should return null / not render)
7. **Performance:** Run Lighthouse on homepage with single-product section — verify improved TTFB vs before

## Implementation Order

1. Add `PRODUCT_VARIANTS_QUERY` to `app/graphql/queries.ts`
2. Run `npm run codegen`
3. Update `app/routes/api/product.ts` to fetch + return variants
4. Convert `single-product` section to client-side fetch (remove loader, add native `fetch` + `useInView`, replace placeholder with skeleton)
5. Update `VariantSelector` to accept + use variants
6. Update `ProductOptionValues` to resolve correct variant via map
7. Wire up callers (`single-product`, `quick-shop`)
8. Remove debug logging
9. Test all 3 contexts (single-product, quick-shop, main product page)

## Reference

- `debug-logs.json` — raw logs proving the bug and data insufficiency
- `HYDROGEN_FUNCTIONS_GUIDE.md` — documentation on `getProductOptions`, `firstSelectableVariant`, and `getAdjacentAndFirstAvailableVariants`
