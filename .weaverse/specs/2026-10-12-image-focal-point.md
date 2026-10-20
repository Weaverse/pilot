# Image focal points

Issue: [#176](https://github.com/Weaverse/pilot/issues/176)

## Outcome

Pilot keeps the part of an image chosen in Weaverse Studio visible when the image is cropped by its frame, and documents how themes apply image focal points.

## Scope & contract

- Consume `WeaverseImage.focalPoint?: { x: number; y: number }` from `@weaverse/hydrogen` 5.23.0+. Coordinates are in `[0, 1]` from the image's top-left corner. The shared contract is owned by [Weaverse/weaverse#528](https://github.com/Weaverse/weaverse/issues/528); Studio controls are [Weaverse/builder#3043](https://github.com/Weaverse/builder/issues/3043).
- Map a valid point to `object-position: X% Y%` on the actual image element, e.g. `{ x: 0.8, y: 0.3 }` → `80% 30%`.
- A valid point takes precedence over the existing position (`object-center` default or the `backgroundPosition` setting). Without one, the existing position applies; legacy image objects and string URLs keep working.
- Images that are not cropped keep their existing fit behavior and ignore the point.
- Non-goals: crop editor, image processing, new assets, mobile-specific points, changes to the Shopify file.

## Acceptance

- Section images and backgrounds apply a saved point; the same file can render with different points in separate sections.
- Removing the point restores the existing position, and an image without a point renders exactly as before (including Hydrogen's computed `aspect-ratio` style).
- `contain`/`fill` images are not repositioned.
- Docs explain the contract, precedence, reset behavior, and that percentage positioning aligns the point with the same relative frame position rather than centering it.

## Approach

- `getFocalPointPosition()` validates the point and returns the CSS value or `undefined`.
- `Image` applies it unless the caller sets `style.objectPosition`; image-with-text sets `center` for its `contain` option.
- `BackgroundImage` applies it only when `backgroundFit` is `cover`.
- Every cropped image input renders through these two components; logos and icons use `object-contain` and are untouched.
- Known limitation: hotspot pins are positioned on the frame, so a point on a cropped hotspot image can move the pins relative to the image content.

Files: `package.json`, `package-lock.json`, `app/utils/image.ts`, `app/components/image.tsx`, `app/components/background-image.tsx`, `app/sections/image-with-text/image.tsx`, `tests/unit/image-focal-point.test.ts`, `.weaverse/docs/image-focal-point.md`.

## Verification

- Unit test for valid, missing, malformed, and out-of-range points.
- Server-render test that `Image` keeps Hydrogen's computed `aspect-ratio` without a point and applies `object-position` with one.
- Typecheck and `npm run check`.
- Manual: with Studio focal point controls, check desktop and mobile frames with portrait and landscape images.
