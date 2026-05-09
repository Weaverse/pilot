# Remove Combined Listings Feature

## Context

Combined listings code adds complexity across 16+ files for a Shopify Plus-only feature most stores don't use. We'll update the cookbook to reflect Pilot's actual architecture (it's currently written for the skeleton template), then remove all combined-listings code. The cookbook stays as a guide for anyone who needs to re-add it.

## Phase 1: Update Cookbook

**File:** `.guides/cookbooks/combined-listings.md`

Rewrite the cookbook to match Pilot's actual structure so it's a valid re-implementation guide:

| Skeleton (current cookbook) | Pilot (update to) |
|---|---|
| `app/lib/combined-listings.ts` | `app/utils/combined-listings.ts` |
| `app/lib/redirect.ts` | `app/.server/redirect.ts` |
| `app/routes/products.$handle.tsx` | `app/routes/products/product.tsx` |
| `app/routes/collections.all.tsx` | `app/routes/products/list.tsx` |
| `combinedListingsSettings` | `COMBINED_LISTINGS_CONFIGS` |
| `import {redirect} from '@shopify/remix-oxygen'` | `import { redirect } from "react-router"` |
| Single `ProductForm` component | 5 Weaverse sections: `product-variant-selector`, `product-prices`, `product-atc-buttons`, `product-quantity-selector`, `product-media` |
| `ProductItem` component | `app/components/product-card/index.tsx` |

Add missing integration points the cookbook doesn't cover:
- `app/components/product/product-option-values.tsx` — `combinedListing` prop for `replace` + `selected` styling
- `app/sections/main-product/variants.tsx` — passes `combinedListing` to ProductOptionValues
- `app/utils/featured-products.ts` — query filtering
- `app/routes/products/recommended-product.ts` — query filtering
- `app/routes/api/products.ts` — combined query filtering
- `app/components/product-grid/products-loaded-on-scroll.tsx` — client-side filtering
- `app/sections/main-product/product-quantity-selector.tsx` — returns null for combined listings

## Phase 2: Remove Code

### GraphQL field analysis (what to keep/remove)

| Field | In `PRODUCT_QUERY` | In `PRODUCT_CARD_FRAGMENT` | Used by non-CL code? | Action |
|-------|---|---|---|---|
| `tags` | Yes | Yes | **No** — only `combined-listings.ts` | **Remove from both** |
| `featuredImage` | Yes | No | Yes — predictive search (separate query) | **Remove from PRODUCT_QUERY** |
| `priceRange` | Yes | Yes | Yes — product-card (`pcardShowLowestPrice`), hotspots, collection filters | **KEEP both** |

### Files to modify (in order)

**Delete:**
1. `app/utils/combined-listings.ts`

**Modify — Route/Server:**
2. `app/.server/redirect.ts` — Remove `redirectIfCombinedListing` + its import
3. `app/routes/products/product.tsx` — Remove CL imports, redirect logic, `combinedListing` variable, useEffect conditional
4. `app/routes/products/list.tsx` — Remove `maybeFilterOutCombinedListingsQuery` import + usage
5. `app/routes/products/recommended-product.ts` — Remove filter import + usage
6. `app/routes/api/products.ts` — Remove combined query filtering

**Modify — Sections (main-product):**
7. `app/sections/main-product/product-variant-selector.tsx` — Remove `isCombinedListing` import + `combinedListing` prop
8. `app/sections/main-product/variants.tsx` — Remove `combinedListing` prop
9. `app/sections/main-product/product-prices.tsx` — Remove CL price range, always show variant price
10. `app/sections/main-product/product-atc-buttons.tsx` — Remove CL null-return
11. `app/sections/main-product/product-quantity-selector.tsx` — Remove CL null-return
12. `app/sections/main-product/product-media.tsx` — Remove featured image insertion for CL

**Modify — Components:**
13. `app/components/product/product-option-values.tsx` — Remove `combinedListing` prop from both `ProductOptionValues` + `OptionValue`, simplify `replace` to always `true`, simplify `selected` conditions
14. `app/components/product-card/index.tsx` — Remove `isCombinedListing` import + usage; simplify pricing to: `pcardShowLowestPrice ? "From {min}" : <VariantPrices />`
15. `app/components/product-grid/products-loaded-on-scroll.tsx` — Remove client-side CL filtering
16. `app/utils/featured-products.ts` — Remove filter import + usage

**Modify — GraphQL:**
17. `app/graphql/queries.ts` — Remove `tags` + `featuredImage` from PRODUCT_QUERY (keep `priceRange`)
18. `app/graphql/fragments.ts` — Remove `tags` from PRODUCT_CARD_FRAGMENT (keep `priceRange`)

**Post-removal:**
19. Run `npm run codegen` to regenerate types
20. Run type-check to verify no broken references

## Verification

1. `npx tsc --noEmit` — no type errors
2. `npx biome check app/` — no lint errors
3. `grep -r "combinedListing\|combined.listing\|isCombinedListing\|COMBINED_LISTINGS" app/` — no remaining references
4. Dev server runs without errors
