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

/**
 * Extract option value from image filename using known option values.
 * e.g., filename "24b_xxx_black.jpg" with options ["Black", "Cream"] → "black"
 */
function extractOptionValueFromUrl(
  url: string,
  knownOptionValues: string[],
): string | null {
  try {
    const parsed = new URL(url);
    const pathname = parsed.pathname;
    const filename = pathname.split("/").pop() || "";
    const nameWithoutExt = filename.replace(/\.[^.]+$/, "").toLowerCase();


    // Check if any known option value appears in the filename
    for (let optionValue of knownOptionValues) {
      let optionLower = optionValue.toLowerCase();
      // Check for _option, -option, or option at end
      if (
        nameWithoutExt.endsWith("_" + optionLower) ||
        nameWithoutExt.endsWith("-" + optionLower) ||
        nameWithoutExt.includes("_" + optionLower + "_") ||
        nameWithoutExt.includes("-" + optionLower + "-") ||
        nameWithoutExt.endsWith(optionLower)
      ) {
        return optionLower;
      }
    }
    return null;
  } catch {
    return null;
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
 * 1. Get all known option values from product.options (e.g., "Black", "Cream")
 * 2. Group media by extracting option value from filename (e.g., "24b_xxx_black.jpg" → "black")
 * 3. Return: matched images (for selected option value) + ungrouped images
 *
 * Re-runs on every variant change.
 */
export function getVariantGroupedMedia({
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

  // Normalize for comparison
  let selectedOptionValueLower = selectedOptionValue.toLowerCase();

  // 2. Get all known option values from product.options
  let knownOptionValues: string[] = [];
  let matchingOption = product.options.find(
    (opt) => opt.name === groupByOption,
  );
  if (matchingOption) {
    knownOptionValues = matchingOption.optionValues.map((ov) => ov.name);
  }

  // 3. Group media by option value extracted from filename
  let groupedMedia: Map<string, MediaFragment[]> = new Map();
  let ungrouped: MediaFragment[] = [];

  for (let media of allMedia) {
    let mediaUrl = media.previewImage?.url;
    if (!mediaUrl) {
      ungrouped.push(media);
      continue;
    }

    let optionValue = extractOptionValueFromUrl(mediaUrl, knownOptionValues);

    if (optionValue) {
      if (!groupedMedia.has(optionValue)) {
        groupedMedia.set(optionValue, []);
      }
      groupedMedia.get(optionValue)!.push(media);
    } else {
      ungrouped.push(media);
    }
  }


  // 4. Get matched media for selected option value
  let matched = groupedMedia.get(selectedOptionValueLower) || [];

  // 5. Fallback: if no matches, show all media
  if (matched.length === 0) {
    return allMedia;
  }

  return [...matched, ...ungrouped];
}
