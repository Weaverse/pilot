import { isBrowser, type WeaverseVideo } from "@weaverse/hydrogen";

export function getPlayerSize(id: string) {
  if (isBrowser) {
    const section = document.querySelector(`[data-wv-id="${id}"]`);
    if (section) {
      const rect = section.getBoundingClientRect();
      const aspectRatio = rect.width / rect.height;
      if (aspectRatio < 16 / 9) {
        return { width: "auto", height: "100%" };
      }
    }
  }
  return { width: "100%", height: "auto" };
}

/**
 * Calculate expected video height based on intrinsic dimensions and container width.
 * This avoids layout shift by setting the correct height before the video renders.
 */
export function calculateVideoHeight(
  video: WeaverseVideo | undefined,
  containerWidth: number,
): number | null {
  // Use WeaverseVideo intrinsic dimensions if available
  if (video?.width && video?.height && containerWidth > 0) {
    const aspectRatio = video.width / video.height;
    return containerWidth / aspectRatio;
  }
  return null;
}
