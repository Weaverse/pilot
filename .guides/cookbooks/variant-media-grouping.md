# Variant Media Grouping

Groups product media by variant option (e.g., Color). When a visitor selects "Black", only images with "black" in the filename are shown, plus shared/ungrouped images. Falls back to all media if no matches.

## How It Works

1. Get the selected option value from `selectedVariant.selectedOptions` (e.g., "Black")
2. Get all known option values from `product.options` for the grouping option (e.g., ["Black", "Cream"])
3. Sort option values by length (descending) so longer values match first (e.g., "Gray Eucalyptus" before "Gray")
4. For each media item, extract the option value from the image filename URL
5. **Filename matching** supports:
   - Single-word values: `_black`, `-black`, `black_`, `black-`, `black` (end)
   - Multi-word values: space is replaced with `_` or `-`
     - "Slate Brown" matches `slate-brown`, `slate_brown`
6. Group media into a `Map<string, MediaFragment[]>` keyed by option value. Media not matching any option goes to `ungrouped[]`
7. Return `{ media: [...matched, ...ungrouped], isGrouped: true }`. If no matches, return `{ media: allMedia, isGrouped: false }` as fallback

## Files

| File | Role |
|------|------|
| `app/components/product/product-media/variant-media-group.ts` | Core logic: `getVariantGroupedMedia()` and `extractOptionValueFromUrl()` |
| `app/components/product/product-media/index.tsx` | Calls the utility when `groupMediaByVariant` is enabled. Uses `displayMedia` instead of `media` for rendering |
| `app/components/product/product-media/media-slider.tsx` | Handles slide navigation based on `isGrouped` flag |
| `app/sections/main-product/index.tsx` | Weaverse schema settings + passes props to `ProductMedia` |
| `app/sections/single-product/index.tsx` | Same as above |

## Weaverse Settings (in both sections)

- **Group media by variant** — switch, default `false`
- **Group by option name** — text, default `"Color"`, conditional on switch being `true`

## Props Added to ProductMedia

```ts
groupMediaByVariant?: boolean;
groupByOption?: string;
product?: NonNullable<ProductQuery["product"]>;
```

## Return Type

```ts
interface VariantGroupedMediaResult {
  media: MediaFragment[];
  isGrouped: boolean;  // true if media was actually grouped by variant
}
```

## Navigation Behavior

When the selected variant changes:

- **If `isGrouped` is true**: Slider resets to the first slide (showing grouped images)
- **If `isGrouped` is false**: Slider navigates to the selected variant's image (better UX when all media is shown)

## To Remove

1. Delete `app/components/product/product-media/variant-media-group.ts`
2. In `app/components/product/product-media/index.tsx`: remove the import, the 3 props above, the `displayMedia` logic block, and revert `displayMedia` references back to `media`
3. In both `app/sections/main-product/index.tsx` and `app/sections/single-product/index.tsx`: remove the `groupMediaByVariant` and `groupByOption` schema settings, interface fields, destructured props, and the 3 extra props on `<ProductMedia>`
4. Run `npm run codegen`
