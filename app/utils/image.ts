import type { ImageAspectRatio } from "~/types/image";

const DEFAULT_GRID_IMG_LOAD_EAGER_COUNT = 4;
const ATTR_LOADING_EAGER = "eager";

export function getImageLoadingPriority(
  index: number,
  maxEagerLoadCount = DEFAULT_GRID_IMG_LOAD_EAGER_COUNT,
): HTMLImageElement["loading"] {
  return index < maxEagerLoadCount ? ATTR_LOADING_EAGER : undefined;
}

export function calculateAspectRatio(
  image: {
    width?: number | null;
    height?: number | null;
    [key: string]: any;
  },
  aspectRatio: ImageAspectRatio,
) {
  if (aspectRatio === "adapt") {
    if (image?.width && image?.height) {
      return `${image.width}/${image.height}`;
    }
    return "1/1";
  }
  return aspectRatio;
}
