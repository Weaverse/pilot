# Model Viewer (3D Models)

Adds support for rendering 3D model media files (.glb/.usdz) uploaded to Shopify products. Uses Hydrogen's ModelViewer component to display interactive 3D models with AR support on product pages.

## How It Works

1. Merchants upload 3D models (.glb/.usdz) to product media in Shopify Admin
2. Storefront API returns Model3d media type with sources containing URLs and mime types
3. `MediaItem` component detects `mediaContentType === "MODEL_3D"` and renders `ModelViewer`
4. ModelViewer lazy-loads Google's @google/model-viewer library (v1.21.1) when rendered
5. 3D models display a cube icon in thumbnails and work in zoom modal

## Files

| File | Role |
|------|------|
| `app/components/product-media/media-item.tsx` | Renders ModelViewer for MODEL_3D media type |
| `app/components/product-media/media-slider.tsx` | Shows CubeIcon badge on 3D model thumbnails |
| `app/components/product-media/media-zoom.tsx` | Shows CubeIcon in zoom thumbnails + renders ModelViewer in zoom modal |
| `app/graphql/fragments.ts` | Already includes Model3d fragment (no changes needed) |

## GraphQL Fragment

The MEDIA_FRAGMENT already includes Model3d fields:

```graphql
fragment Media on Media {
  __typename
  mediaContentType
  alt
  previewImage {
    id
    url
    altText
    width
    height
  }
  ... on Model3d {
    id
    sources {
      mimeType
      url
    }
  }
  # ... other media types
}
```

## ModelViewer Usage

```tsx
import { ModelViewer } from '@shopify/hydrogen';
import type { Media_Model3d_Fragment } from 'storefront-api.generated';

// In your component:
if (media.mediaContentType === "MODEL_3D") {
  const media3d = media as Media_Model3d_Fragment;
  return (
    <ModelViewer
      data={media3d}
      className="h-auto w-full"
      onLoad={(event) => console.log('3D model loaded', event)}
      onError={(event) => console.error('Error loading 3D model', event)}
    />
  );
}
```

## Event Callbacks

ModelViewer supports these event handlers:
- `onLoad` - Model loaded successfully
- `onError` - Error loading model
- `onArStatus` - AR status changed
- `onArTracking` - AR tracking state changed
- `onCameraChange` - Camera position changed
- `onEnvironmentChange` - Environment/lighting changed
- `onModelVisibility` - Model visibility changed
- `onPause` / `onPlay` - Animation playback
- `onProgress` - Loading progress
- `onSceneGraphReady` - Scene graph ready

## UI Indicators

3D models show a cube icon (CubeIcon from @phosphor-icons/react) in:
- Thumbnail slides (bottom-right corner, similar to video icon)
- Zoom modal thumbnails

## To Remove

1. In `app/components/product-media/media-item.tsx`:
   - Remove ModelViewer import
   - Remove Media_Model3d_Fragment import
   - Remove MODEL_3D case block

2. In `app/components/product-media/media-slider.tsx`:
   - Remove CubeIcon import
   - Remove MODEL_3D icon badge from SwiperSlide

3. In `app/components/product-media/media-zoom.tsx`:
   - Remove ModelViewer and CubeIcon imports
   - Remove Media_Model3d_Fragment import
   - Remove MODEL_3D icon badge from thumbnail map
   - Remove MODEL_3D case from ZoomMedia function

4. Run `npm run codegen` (if you modified fragments, though not needed for removal)

## Requirements

- Product must have 3D model uploaded in Shopify Admin (Media section)
- ModelViewer is from `@shopify/hydrogen` (not @shopify/hydrogen-react)
- Supports .glb and .usdz file formats
