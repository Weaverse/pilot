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
 * Algorithm:
 * 1. Group product images by option value (lowercase) - { "black": [url1, url2], "cream": [url3] }
 * 2. Collect ALL variant image URLs to identify ungrouped/shared media
 * 3. Return: matched images (for selected option value) + ungrouped images
 *
 * Re-runs on every variant change.
 */
function getVariantGroupedMedia({
  allMedia,
  selectedVariant,
  product,
  groupByOption,
}: VariantGroupedMediaParams): MediaFragment[] {
  console.log("[VariantMedia] === START ===");
  console.log("[VariantMedia] groupByOption:", groupByOption);
  console.log("[VariantMedia] allMedia count:", allMedia.length);
  console.log("[VariantMedia] selectedVariant:", selectedVariant?.title, selectedVariant?.id);

  // 1. Find the selected option value for the grouping option
  let selectedOptionValue = selectedVariant.selectedOptions.find(
    (opt) => opt.name === groupByOption,
  )?.value;

  console.log("[VariantMedia] selectedOptionValue:", selectedOptionValue);
  console.log("[VariantMedia] selectedVariant.selectedOptions:", selectedVariant.selectedOptions);

  if (!selectedOptionValue) {
    console.log("[VariantMedia] No selectedOptionValue found, returning allMedia");
    return allMedia;
  }

  // Normalize for comparison
  let selectedOptionValueLower = selectedOptionValue.toLowerCase();

  // 2. Build groups: option value (lowercase) → Set of image URLs
  let groupedUrls: Map<string, Set<string>> = new Map();
  let allVariantUrls: Set<string> = new Set(); // To identify ungrouped media

  // From all variants
  console.log("[VariantMedia] product.variants?.nodes count:", product.variants?.nodes?.length);
  if (product.variants?.nodes) {
    for (let variant of product.variants.nodes) {
      let option = variant.selectedOptions.find(
        (opt) => opt.name === groupByOption,
      );
      if (option?.value && variant.image?.url) {
        let optionValueLower = option.value.toLowerCase();
        let normalizedUrl = normalizeImageUrl(variant.image.url);

        // Add to group
        if (!groupedUrls.has(optionValueLower)) {
          groupedUrls.set(optionValueLower, new Set());
        }
        groupedUrls.get(optionValueLower)!.add(normalizedUrl);

        // Track all variant URLs
        allVariantUrls.add(normalizedUrl);
      }
    }
  }

  console.log("[VariantMedia] groupedUrls keys:", Array.from(groupedUrls.keys()));
  console.log("[VariantMedia] groupedUrls:", Object.fromEntries(
    Array.from(groupedUrls.entries()).map(([k, v]) => [k, Array.from(v)])
  ));
  console.log("[VariantMedia] allVariantUrls:", Array.from(allVariantUrls));

  // 3. Get URLs for selected option value
  let selectedGroupUrls = groupedUrls.get(selectedOptionValueLower) || new Set();
  console.log("[VariantMedia] selectedGroupUrls for", selectedOptionValueLower, ":", Array.from(selectedGroupUrls));

  // 4. Partition media into matched, ungrouped
  let matched: MediaFragment[] = [];
  let ungrouped: MediaFragment[] = [];

  for (let media of allMedia) {
    let mediaUrl = media.previewImage?.url;
    if (!mediaUrl) {
      // Media without preview image goes to ungrouped
      ungrouped.push(media);
      continue;
    }

    let normalizedMediaUrl = normalizeImageUrl(mediaUrl);

    // Check if this media matches the selected option value
    if (selectedGroupUrls.has(normalizedMediaUrl)) {
      matched.push(media);
      console.log("[VariantMedia] MATCHED:", media.alt, "→", normalizedMediaUrl);
    } else if (!allVariantUrls.has(normalizedMediaUrl)) {
      // Media that doesn't match ANY variant → ungrouped (shared)
      ungrouped.push(media);
      console.log("[VariantMedia] UNGROUPED:", media.alt, "→", normalizedMediaUrl);
    } else {
      console.log("[VariantMedia] EXCLUDED (other group):", media.alt, "→", normalizedMediaUrl);
    }
  }

  console.log("[VariantMedia] matched count:", matched.length);
  console.log("[VariantMedia] ungrouped count:", ungrouped.length);

  // 5. Fallback: if no matches, show all media
  if (matched.length === 0) {
    console.log("[VariantMedia] No matches, returning allMedia as fallback");
    return allMedia;
  }

  console.log("[VariantMedia] === END: returning", matched.length + ungrouped.length, "items ===");
  return [...matched, ...ungrouped];
}

export { getVariantGroupedMedia, normalizeImageUrl };
export type { VariantGroupedMediaParams };
