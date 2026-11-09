# Variant Media Grouping

Built into Pilot. Groups product media by a variant option (e.g., Color). When a visitor selects "Black", only images with "black" in the filename are shown, plus shared/ungrouped images. Falls back to all media if no image matches.

## How It Works

1. Get the selected option value from `selectedVariant.selectedOptions` (e.g., "Black"). The selected variant comes from the product form (`useSelectedVariant(product)` in `app/components/product/product-form.tsx`), so the media updates in place when the shopper picks another value.
2. Get all known option values from `product.options` for the grouping option (e.g., ["Black", "Cream"])
3. Sort option values by length (descending) so longer values match first (e.g., "Gray Eucalyptus" before "Gray")
4. For each media item, extract the option value from the image filename URL
5. **Filename matching** supports:
   - Single-word values: `black_…`, `black-…`, `…_black`, `…-black`, or a name ending in `black`
   - Multi-word values: space is replaced with `_` or `-`
     - "Slate Brown" matches `slate-brown`, `slate_brown`
6. Group media into a `Map<string, MediaFragment[]>` keyed by option value. Media not matching any option goes to `ungrouped[]`
7. Return `{ media: [...matched, ...ungrouped], isGrouped: true }`. If no matches, return `{ media: allMedia, isGrouped: false }` as fallback

## Files

| File | Role |
|------|------|
| `app/components/product-media/variant-media-group.ts` | Core logic: `getVariantGroupedMedia()` and `extractOptionValueFromUrl()` |
| `app/components/product-media/index.tsx` | `ProductMedia` calls the utility when `groupMediaByVariant` is on and renders `displayMedia` |
| `app/components/product-media/media-slider.tsx` | Slide navigation based on the `isGrouped` result (passed as `groupMediaByVariant`) |
| `app/sections/main-product/product-media.tsx` | Product page media block: schema settings, passes the props to `ProductMedia` |
| `app/sections/single-product/index.tsx` | Single-product section: schema settings, passes the props to `ProductMedia` |
| `app/components/product-card/quick-shop.tsx` | Quick shop: reads the theme settings below and passes them to `ProductMedia` |
| `app/weaverse/settings/product-cards.ts` | Quick shop theme settings |

## Weaverse Settings

| Where | Switch | Option name |
|-------|--------|-------------|
| Product page → Product Media block | **Group media by variant** (`groupMediaByVariant`, default `true`) | **Group by option name** (`groupByOption`, default `"Color"`) |
| Single product section → Product Media group | **Group media by variant** (`groupMediaByVariant`, default `false`) | **Group by option name** (`groupByOption`, default `"Color"`) |
| Theme settings → Product cards → Variant images grouping | **Group images by variant in quick shop** (`quickShopGroupMediaByVariant`, default `true`) | **Group by option name** (`quickShopGroupByOption`, default `"Color"`) |

The option name field only shows while its switch is on.

## ProductMedia Props

```ts
groupMediaByVariant?: boolean;
groupByOption?: string;
product?: NonNullable<ProductQuery["product"]>; // ProductQuery from ~/graphql/queries
```

## Return Type

```ts
interface VariantGroupedMediaResult {
  media: MediaFragment[]; // MediaFragment from ~/graphql/fragments
  isGrouped: boolean; // true if media was actually grouped by variant
}
```

## Navigation Behavior

When the selected variant changes:

- **If `isGrouped` is true**: Slider resets to the first slide (showing grouped images)
- **If `isGrouped` is false**: Slider navigates to the selected variant's image (better UX when all media is shown)

## To Disable

Turn the switches above off in Weaverse Studio. No code change is needed.

## To Remove

1. Delete `app/components/product-media/variant-media-group.ts`.
2. In `app/components/product-media/index.tsx`: remove the `getVariantGroupedMedia` import, the 3 props above (and the now-unused `ProductQuery` import), the grouping block (keep `let displayMedia = media;`), and the `groupMediaByVariant={isMediaGrouped}` prop on `<MediaSlider>`.
3. In `app/components/product-media/media-slider.tsx`: remove the `groupMediaByVariant` prop, and in the selected-variant effect keep only the "navigate to the selected variant's image" branch.
4. In `app/sections/main-product/product-media.tsx`: remove `groupMediaByVariant` and `groupByOption` from the destructured props, the 3 props passed to `<ProductMedia>` (`groupMediaByVariant`, `groupByOption`, `product`), and the "Media group" heading plus its two schema inputs.
5. In `app/sections/single-product/index.tsx`: remove the two fields from `SingleProductData`, from both destructurings (`SingleProduct` and `SingleProductContent`), from the `<SingleProductContent>` props, the 3 props on `<ProductMedia>`, and the two schema inputs.
6. In `app/components/product-card/quick-shop.tsx`: stop reading `quickShopGroupMediaByVariant`/`quickShopGroupByOption` from the theme settings and remove the 3 props on `<ProductMedia>`.
7. In `app/weaverse/settings/product-cards.ts`: remove the "Variant images grouping" heading and its two inputs.
8. Regenerate the component manifest and check types:

```bash
npm run weaverse:manifest
npm run typecheck
```
