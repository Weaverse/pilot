# Implementation Plan: Model Viewer Support

## Files to Modify

1. **app/components/product-media/media-item.tsx**
   - Import ModelViewer from @shopify/hydrogen
   - Import Media_Model3d_Fragment type
   - Add MODEL_3D case to render ModelViewer component

2. **app/components/product-media/media-slider.tsx**
   - Import CubeIcon from @phosphor-icons/react
   - Add 3D model icon badge in thumbnail slides (similar to video icon)

3. **app/components/product-media/media-zoom.tsx**
   - Import ModelViewer from @shopify/hydrogen
   - Import CubeIcon for thumbnail indicator
   - Import Media_Model3d_Fragment type
   - Add 3D model icon badge in zoom modal thumbnails
   - Add MODEL_3D case in ZoomMedia function

## Technical Details

### GraphQL Fragment
The MEDIA_FRAGMENT in app/graphql/fragments.ts already includes Model3d fields:
```graphql
... on Model3d {
  id
  sources {
    mimeType
    url
  }
}
```

No changes needed to fragments as Model3d was already being fetched.

### ModelViewer Component
- From @shopify/hydrogen (NOT @shopify/hydrogen-react)
- Renders Google's <model-viewer> web component
- Lazy-loads @google/model-viewer v1.21.1 when rendered
- Accepts Model3d data from Storefront API

### UI Changes
- 3D models show a cube icon (CubeIcon) in thumbnails
- Consistent with existing video indicator pattern
- Full zoom/modal support for 3D models

## Implementation Status

- [x] media-item.tsx - ModelViewer rendering
- [x] media-slider.tsx - 3D icon in thumbnails
- [x] media-zoom.tsx - 3D icon and zoom support
- [x] Type checking passed
- [x] Formatting applied
