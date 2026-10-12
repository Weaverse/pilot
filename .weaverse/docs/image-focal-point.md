# Image focal points

Weaverse Studio can save a focal point on each image input. Pilot uses it to
keep the selected part of the image visible when the image is cropped by its
frame (`object-fit: cover`).

## Data contract

`WeaverseImage` (from `@weaverse/hydrogen` 5.23.0+) has an optional field:

```ts
focalPoint?: { x: number; y: number }
```

Coordinates are numbers from `0` to `1`, measured from the image's top-left
corner. The point belongs to the image input, not to the Shopify file, so the
same file can use different points in different sections.

## How Pilot applies it

`getFocalPointPosition()` in `app/utils/image.ts` converts a valid point to a
CSS `object-position` value, for example `{ x: 0.8, y: 0.3 }` → `80% 30%`. It
returns `undefined` for string URLs, images without a point, and malformed or
out-of-range points.

Both shared renderers apply it to the actual `<img>` element:

- `app/components/image.tsx` (`Image`) overrides its default `object-center`.
  An explicit `style.objectPosition` from the caller still wins.
- `app/components/background-image.tsx` (`BackgroundImage`) overrides the
  section's `backgroundPosition` setting when `backgroundFit` is `cover`.

Every image input that Pilot renders cropped goes through one of these two
components, so sections need no extra code. Images that are not cropped keep
their existing fit and ignore the point: `contain`/`fill` backgrounds, the
image-with-text `contain` option, and logos and icons.

To use it in a custom component:

```tsx
import type { WeaverseImage } from "@weaverse/hydrogen";
import { getFocalPointPosition } from "~/utils/image";

function Banner({ image }: { image: WeaverseImage }) {
  return (
    <img
      src={image.url}
      alt={image.altText}
      className="h-full w-full object-cover object-center"
      style={{ objectPosition: getFocalPointPosition(image) }}
    />
  );
}
```

## Precedence and reset

- A valid focal point takes precedence over the existing position (the
  `object-center` default or the `backgroundPosition` setting).
- Without a focal point, the existing position applies unchanged. Resetting the
  point in Studio removes the field, which restores that position.

## Limits

Percentage positioning aligns the selected point of the image with the same
relative position in the frame. For example, `80% 30%` places the point 80%
across and 30% down the frame. It does not necessarily center the point, and it
cannot guarantee the whole subject stays visible at every aspect ratio.

The hotspots section positions its pins as percentages of the frame. When its
aspect ratio crops the image, a focal point changes which part of the image is
visible, so pins can drift away from the product they mark. Use the "Adapt to
image" aspect ratio for hotspots, or keep the point near the center.
