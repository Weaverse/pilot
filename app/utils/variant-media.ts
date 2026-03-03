import type {
  MediaFragment,
  ProductQuery,
  ProductVariantFragment,
} from "storefront-api.generated";

/**
 * Normalize a Shopify CDN image URL for comparison by stripping query params.
 * e.g., "https://cdn.shopify.com/s/.../image.jpg?width=200&v=123"
 *     → "cdn.shopify.com/s/.../image.jpg"
 */
function normalizeImageUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname + parsed.pathname;
  } catch {
    return url;
  }
}

type Product = NonNullable<ProductQuery["product"]>;

interface VariantGroupedMediaParams {
  allMedia: MediaFragment[];
  selectedVariant: ProductVariantFragment;
  product: Product;
  groupByOption: string;
}

/**
 * Filter product media based on the selected variant's option value.
 *
 * Collects all variant image URLs that share the same option value
 * (e.g., all "Black" variants), then partitions media into:
 * - matched: media whose previewImage URL matches a variant image
 * - unmatched: everything else (shared/lifestyle media)
 *
 * Returns [...matched, ...unmatched], or all media as fallback
 * when no matches are found.
 */
function getVariantGroupedMedia({
  allMedia,
  selectedVariant,
  product,
  groupByOption,
}: VariantGroupedMediaParams): MediaFragment[] {
  // 1. Find the selected option value for the grouping option
  let selectedOptionValue = selectedVariant.selectedOptions.find(
    (opt) => opt.name === groupByOption,
  )?.value;

  if (!selectedOptionValue) {
    return allMedia;
  }

  // 2. Collect all variant image URLs for this option value
  let variantImageUrls = new Set<string>();

  // From selectedVariant
  if (selectedVariant.image?.url) {
    variantImageUrls.add(normalizeImageUrl(selectedVariant.image.url));
  }

  // From product.options → optionValues → firstSelectableVariant
  let matchingOption = product.options.find(
    (opt) => opt.name === groupByOption,
  );
  if (matchingOption) {
    for (let optionValue of matchingOption.optionValues) {
      if (optionValue.name === selectedOptionValue) {
        let imageUrl = optionValue.firstSelectableVariant?.image?.url;
        if (imageUrl) {
          variantImageUrls.add(normalizeImageUrl(imageUrl));
        }
      }
    }
  }

  // From all variants
  if (product.variants?.nodes) {
    for (let variant of product.variants.nodes) {
      let hasMatchingOption = variant.selectedOptions.some(
        (opt) => opt.name === groupByOption && opt.value === selectedOptionValue,
      );
      if (hasMatchingOption && variant.image?.url) {
        variantImageUrls.add(normalizeImageUrl(variant.image.url));
      }
    }
  }

  // 3. Partition media into matched and unmatched
  let matched: MediaFragment[] = [];
  let unmatched: MediaFragment[] = [];

  for (let media of allMedia) {
    let mediaUrl = media.previewImage?.url;
    if (mediaUrl && variantImageUrls.has(normalizeImageUrl(mediaUrl))) {
      matched.push(media);
    } else {
      unmatched.push(media);
    }
  }

  // 4. Fallback: if no matches, show all media
  if (matched.length === 0) {
    return allMedia;
  }

  return [...matched, ...unmatched];
}

export { getVariantGroupedMedia, normalizeImageUrl };
export type { VariantGroupedMediaParams };
