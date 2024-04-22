export const PAGINATION_SIZE = 16;
export const DEFAULT_GRID_IMG_LOAD_EAGER_COUNT = 4;
export const ATTR_LOADING_EAGER = 'eager';
export const FALLBACK_IMAGE =
  'https://cdn.shopify.com/s/files/1/0838/0052/3057/files/h2-placeholder-image.svg';

export function getImageLoadingPriority(
  index: number,
  maxEagerLoadCount = DEFAULT_GRID_IMG_LOAD_EAGER_COUNT,
) {
  return index < maxEagerLoadCount ? ATTR_LOADING_EAGER : undefined;
}
