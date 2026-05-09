# Plan: Global Border Radius System (v2)

## Approach

Single `radiusBase` setting in Weaverse theme config, injected as `--radius` on `:root` via `GlobalStyle`. All Tailwind radius variables (`--radius-sm`, `--radius-md`, `--radius-lg`, etc.) are **calculated from the base** in `@theme inline`, so changing one value scales proportionally everywhere.

Components use **semantic Tailwind classes** (`rounded-sm`, `rounded-md`, `rounded-lg`, etc.) — NOT a single `rounded-(--radius)` everywhere. Different elements get different radius scales:

| Element type | Class | Reasoning |
|--------------|-------|-----------|
| Badges | `rounded-sm` | Subtle, small elements |
| Tooltips | `rounded-md` | Small floating elements |
| Buttons, links | `rounded-md` | Standard interactive elements |
| Inputs / textareas / selects | `rounded-md` | Match buttons |
| Product cards | `rounded-md` | Cards, medium elements |
| Images / videos | `rounded-md` | Match cards |
| Option buttons (size, etc.) | `rounded-md` | Small interactive |
| Quantity selector | `rounded-md` | Input-like |
| Sort dropdown trigger | `rounded-md` | Button-like |
| Slideshow arrows | `rounded-md` | Button-like |
| Testimonial cards | `rounded-md` | Card elements |
| Sections (with bg) | `rounded-lg` | Larger containers need more radius |
| Popups / modals / dialogs | `rounded-lg` | Prominent overlays |
| Dropdown/popover content | `rounded-lg` | Floating panels |
| Select dropdown content | `rounded-lg` | Floating panels |
| Collection banners | `rounded-lg` | Large visual containers |
| Newsletter form (outer wrap) | `rounded-md` | Combined input+button, inner elements use `rounded-none` |
| Shop Pay button | `var(--radius)` | Third-party, uses base value |

**All per-component border radius settings are removed.** No more product card radius, badge radius, section radius, collection banner radius, map box radius, image radius, etc. Global config only.

## How Tailwind Scaling Works

Tailwind v4 defines individual `--radius-*` variables in its theme (default `--radius: 0.25rem`). We override them in `@theme inline` to scale from the dynamic `--radius` set by Weaverse:

```css
@theme inline {
  --radius-xs: calc(var(--radius) * 0.5);
  --radius-sm: calc(var(--radius) * 0.75);
  --radius-md: var(--radius);
  --radius-lg: calc(var(--radius) * 1.5);
  --radius-xl: calc(var(--radius) * 2);
  --radius-2xl: calc(var(--radius) * 3);
  --radius-3xl: calc(var(--radius) * 4);
  --radius-4xl: calc(var(--radius) * 5);
}
```

When `radiusBase = 8px`:
- `rounded-sm` → 6px, `rounded` / `rounded-md` → 8px, `rounded-lg` → 12px, `rounded-xl` → 16px
When `radiusBase = 0`:
- Everything → 0px (fully square)

## Files Touched

### Keep (from v1)

| File | Changes |
|------|---------|
| `app/weaverse/settings/border-radius.ts` | No changes — keep as-is |
| `app/weaverse/schema.server.ts` | No changes — keep as-is |
| `app/weaverse/style.tsx` | No changes — `--radius` injection stays |

### Modify

| File | Changes |
|------|---------|
| `app/styles/app.css` | Add `--radius-*` overrides in `@theme inline`; update `input, textarea` from `rounded-(--radius)` to `rounded`; keep shop-pay and swatch token wiring |
| `app/components/button.tsx` | `rounded-(--radius)` → `rounded` |
| `app/components/section.tsx` | Remove `borderRadius` prop entirely; remove `--section-radius` CSS var; remove `borderRadius` from `layoutInputs`; use `rounded-lg` on section bg container |
| `app/components/product-card/index.tsx` | Remove `pcardBorderRadius` fallback logic; use `rounded` class directly |
| `app/components/product-card/quick-shop.tsx` | `rounded-(--radius)` → `rounded-lg` on the popup panel |
| `app/components/product/badges.tsx` | Remove `badgeBorderRadius` inline style; use `rounded-sm` class |
| `app/components/root/newsletter-popup.tsx` | `rounded-(--radius)` → `rounded-lg` on the popup |
| `app/sections/columns-with-images/column.tsx` | Remove `imageBorderRadius` prop & `--radius` local var; use `rounded` on image |
| `app/sections/featured-collections/collection-items.tsx` | Remove `borderRadius` CVA variant; use `rounded` class directly |
| `app/sections/image-gallery/image.tsx` | Remove `borderRadius` CVA variant; use `rounded` class directly |
| `app/sections/image-with-text/image.tsx` | Remove `borderRadius` CVA variant; use `rounded` class directly |
| `app/sections/promotion-grid/item.tsx` | Remove `borderRadius` CVA variant; use `rounded` class directly |
| `app/sections/video-embed/video.tsx` | Remove `borderRadius` CVA variant; use `rounded` class directly |
| `app/sections/testimonials/item.tsx` | `rounded-(--radius)` → `rounded` |
| `app/sections/main-collection/collection-header/index.tsx` | Remove `bannerBorderRadius` prop & `--banner-border-radius` var; use `rounded-lg` class |
| `app/sections/map.tsx` | Remove `boxBorderRadius` inline style; use `rounded-lg` class |
| `app/sections/countdown/index.tsx` | Remove `borderRadius` setting from inspector inputs |

### Sections that filter out `borderRadius` from `layoutInputs` (no code changes needed once `layoutInputs` drops it)

These sections already filter `borderRadius` out, so they only need the filter removed (or left as-is — filtering a non-existent input is harmless):
- `app/sections/featured-collections/index.tsx`
- `app/sections/featured-products/index.tsx`
- `app/sections/collection-list/index.tsx`
- `app/sections/page.tsx`
- `app/sections/hero-image.tsx`
- `app/sections/slideshow/slide.tsx`
- `app/sections/ali-reviews/index.tsx`
- `app/sections/judgeme-reviews/index.tsx`
- `app/sections/related-products.tsx`
- `app/sections/our-team/index.tsx`
- `app/sections/blog-post.tsx`
- `app/sections/main-collection/index.tsx`

## Implementation Steps

### Step 1: Wire up Tailwind theme scaling in `app.css`

Add to `@theme inline` block:
```css
--radius-xs: calc(var(--radius) * 0.5);
--radius-sm: calc(var(--radius) * 0.75);
--radius-md: var(--radius);
--radius-lg: calc(var(--radius) * 1.5);
--radius-xl: calc(var(--radius) * 2);
--radius-2xl: calc(var(--radius) * 3);
--radius-3xl: calc(var(--radius) * 4);
--radius-4xl: calc(var(--radius) * 5);
```

Update `input, textarea` rule: `rounded-(--radius)` → `rounded`.

### Step 2: Remove `borderRadius` from `layoutInputs` in `section.tsx`

Remove the `borderRadius` range input from `layoutInputs` array.
Remove `borderRadius` prop from `SectionProps`.
Remove `--section-radius` CSS variable logic.
Add `rounded-lg` to the section background container when it has a background.

### Step 3: Update all components to use semantic classes

Replace `rounded-(--radius)` with the appropriate Tailwind class:
- `button.tsx` → `rounded`
- `quick-shop.tsx` popup → `rounded-lg`
- `newsletter-popup.tsx` → `rounded-lg`
- `testimonials/item.tsx` → `rounded`

### Step 4: Remove per-component border radius settings

For each component with its own `borderRadius` inspector input:
- Remove the setting from the inspector schema
- Remove the prop from the component
- Remove any CSS variable / inline style logic
- Apply the appropriate static `rounded-*` class

Components: `product-card/index.tsx`, `product/badges.tsx`, `columns-with-images/column.tsx`, `collection-header/index.tsx`, `map.tsx`, `countdown/index.tsx`

### Step 5: Remove CVA `borderRadius` variants

For each section with a `borderRadius` CVA variant:
- Remove the variant from the CVA definition
- Remove the prop destructuring
- Remove from schema inputs
- Add the appropriate static `rounded-*` class to the element

Components: `featured-collections/collection-items.tsx`, `image-gallery/image.tsx`, `image-with-text/image.tsx`, `promotion-grid/item.tsx`, `video-embed/video.tsx`

### Step 6: Clean up sections that filter `borderRadius`

Remove `.filter((i) => i.name !== "borderRadius")` from sections that no longer need it (since `layoutInputs` won't have it anymore). This is optional cleanup — the filter is harmless.

## Not Changing

These components use `rounded-full` intentionally for circular/pill shapes:
- Color swatches (`product-card-options.tsx`) — circular by design
- Cart count badge (`cart-drawer.tsx`) — circular badge
- Spinner (`spinner.tsx`) — circular animation
- Close/zoom buttons (`media-zoom.tsx`) — circular icon buttons
- Quick shop icon button (`quick-shop.tsx`) — circular icon button

## Verification

1. `nr typecheck` — types compile
2. `nr format && nr fix` — lint passes
3. Set `radiusBase` to `0` → all elements are fully square
4. Set `radiusBase` to `8` → buttons/inputs show 8px, sections/popups show 12px, badges show 6px
5. Set `radiusBase` to `20` → visually confirm proportional scaling across all element types
6. Confirm no per-component radius settings appear in Weaverse editor
