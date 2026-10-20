import type { ImageAspectRatio } from "~/types/others";

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

function isUnitCoordinate(value: unknown): value is number {
  return typeof value === "number" && value >= 0 && value <= 1;
}

// Rounds to 2 decimals so float noise (0.29 * 100 = 28.999999999999996) stays out of the CSS.
function toPercent(n: number) {
  return Math.round(n * 10_000) / 100;
}

/**
 * Converts a Weaverse image's per-input focal point (`{ x, y }`, from 0 to 1,
 * measured from the image's top-left corner) to a CSS `object-position`.
 * Returns `undefined` for string URLs, images without a focal point, and
 * malformed points, so callers keep their existing position.
 */
export function getFocalPointPosition(image: unknown) {
  const { x, y } =
    (image as { focalPoint?: { x?: unknown; y?: unknown } } | null)
      ?.focalPoint ?? {};
  if (isUnitCoordinate(x) && isUnitCoordinate(y)) {
    return `${toPercent(x)}% ${toPercent(y)}%`;
  }
  return undefined;
}
