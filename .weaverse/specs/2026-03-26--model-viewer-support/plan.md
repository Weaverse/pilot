# Plan: Model Viewer & External Video Support

## What Already Works

The infrastructure is 95% in place:

- **GraphQL**: `MEDIA_FRAGMENT` in `app/graphql/fragments.ts` already fetches `Model3d` (sources, mimeType, url) and `ExternalVideo` (embedUrl, host) fields
- **Types**: `MediaFragment` union includes `Media_Model3d_Fragment` and `Media_ExternalVideo_Fragment`
- **CSS**: `app/styles/app.css` already has `model-viewer::part(default-progress-mask)` and `model-viewer::part(default-progress-bar)` overrides
- **Package**: `ModelViewer` and `ExternalVideo` are exported from `@shopify/hydrogen` (v2026.1.2)

## What's Missing

The rendering components return `null` for `MODEL_3D` and `EXTERNAL_VIDEO` media types:

- `media-item.tsx` — only handles `IMAGE` and `VIDEO`
- `media-zoom.tsx` (`ZoomMedia`) — only handles `IMAGE` and `VIDEO`
- `media-slider.tsx` — thumbnail badges only exist for `VIDEO`
- `media-zoom.tsx` — thumbnail badges only exist for `VIDEO`

## Files Touched

| File | Action |
|------|--------|
| `app/components/product-media/media-item.tsx` | Modify — add `MODEL_3D` and `EXTERNAL_VIDEO` rendering branches |
| `app/components/product-media/media-zoom.tsx` | Modify — add `MODEL_3D` and `EXTERNAL_VIDEO` in `ZoomMedia` + thumbnail badge |
| `app/components/product-media/media-slider.tsx` | Modify — add `MODEL_3D` thumbnail badge |

## Implementation Steps

### Step 1: `media-item.tsx` — Add rendering branches

Add two new branches after the existing `VIDEO` block, before `return null`:

**Imports to add:**
- `ModelViewer`, `ExternalVideo` from `@shopify/hydrogen`
- `Media_ExternalVideo_Fragment`, `Media_Model3d_Fragment` from `storefront-api.generated`

**`MODEL_3D` branch:**
- Use `ModelViewer` component with `data` prop set to the `Model3d` media object
- Enable `camera-controls` for interactive rotation
- Set `poster` to `previewImage.url` for loading placeholder
- Apply `className` and aspect ratio styling consistent with existing media items

**`EXTERNAL_VIDEO` branch:**
- Use `ExternalVideo` component with `data` prop set to the `ExternalVideo` media object
- Apply `aspect-video` for 16:9 ratio (standard for YouTube/Vimeo)

### Step 2: `media-zoom.tsx` — Add zoom modal rendering + thumbnail badge

**In `ZoomMedia` function:**
- Add same `MODEL_3D` branch — render `ModelViewer` at `h-[80vh]` for zoom view
- Add same `EXTERNAL_VIDEO` branch — render `ExternalVideo` at zoom dimensions

**In thumbnail sidebar (`.map()` over `media`):**
- Add `CubeIcon` badge for `MODEL_3D` thumbnails (same pattern as existing `VideoCameraIcon` for `VIDEO`)

**Imports to add:**
- `CubeIcon` from `@phosphor-icons/react`
- `ModelViewer`, `ExternalVideo` from `@shopify/hydrogen`
- `Media_ExternalVideo_Fragment`, `Media_Model3d_Fragment` from `storefront-api.generated`

### Step 3: `media-slider.tsx` — Add thumbnail badge

In the thumbnails `Swiper` section, add `CubeIcon` badge for `MODEL_3D` type — mirrors existing `VideoCameraIcon` pattern for `VIDEO`.

**Import to add:**
- `CubeIcon` from `@phosphor-icons/react`

## Icon Choice

Use `CubeIcon` from `@phosphor-icons/react` (already a project dependency) for 3D model badges — consistent with existing `VideoCameraIcon` usage for video thumbnails.

## Verification

1. Run `nr typecheck` to verify types compile
2. Test with a product that has 3D media uploaded in Shopify admin
3. Verify model renders in both grid and slider layouts
4. Verify model renders in zoom modal
5. Verify thumbnail shows cube icon badge
