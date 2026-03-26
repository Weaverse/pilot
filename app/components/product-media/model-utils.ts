import type { Media_Model3d_Fragment } from "storefront-api.generated";

let GLB_MIME = "model/gltf-binary";
let USDZ_MIME = "model/vnd.usdz+zip";

/**
 * Reorder Model3d sources so GLB comes first (Shopify's ModelViewer uses sources[0] as src).
 * Also extract the USDZ source URL for iOS AR support.
 */
export function getModel3dData(model3d: Media_Model3d_Fragment) {
  let glbSource = model3d.sources.find((s) => s.mimeType === GLB_MIME);
  let usdzSource = model3d.sources.find((s) => s.mimeType === USDZ_MIME);

  // Debug: log what sources Shopify is returning
  console.log("[ModelViewer] raw sources:", JSON.stringify(model3d.sources, null, 2));
  console.log("[ModelViewer] glbSource:", glbSource);
  console.log("[ModelViewer] usdzSource:", usdzSource);

  // Put GLB first so ModelViewer uses it as src
  let sortedSources = [
    ...(glbSource ? [glbSource] : []),
    ...model3d.sources.filter(
      (s) => s.mimeType !== GLB_MIME && s.mimeType !== USDZ_MIME,
    ),
    ...(usdzSource ? [usdzSource] : []),
  ];

  console.log("[ModelViewer] sortedSources[0] (will be used as src):", sortedSources[0]);

  return {
    data: {
      ...model3d,
      alt: model3d.alt || "3D model",
      sources: sortedSources,
    },
    iosSrc: usdzSource?.url,
  };
}
