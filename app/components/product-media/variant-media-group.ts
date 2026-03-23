import type {
  MediaFragment,
  ProductQuery,
  ProductVariantFragment,
} from "storefront-api.generated";

type Product = NonNullable<ProductQuery["product"]>;

interface VariantGroupedMediaParams {
  allMedia: MediaFragment[];
  selectedVariant: ProductVariantFragment;
  product: Product;
  groupByOption: string;
}

interface VariantGroupedMediaResult {
  media: MediaFragment[];
  isGrouped: boolean;
}

/**
 * Extract option value from image filename using known option values.
 * e.g., filename "24b_xxx_black.jpg" with options ["Black", "Cream"] → "black"
 *
 * Handles multi-word option values by checking transformed versions:
 * - "Slate Brown" matches "slate-brown", "slate_brown"
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
    // Sort by length descending to match longer (more specific) values first
    // e.g., "Gray Eucalyptus" should match before "Gray"
    let sortedOptionValues = [...knownOptionValues].sort(
      (a, b) => b.length - a.length,
    );
    for (let optionValue of sortedOptionValues) {
      let optionLower = optionValue.toLowerCase();

      // Generate transformed versions for multi-word option values
      // e.g., "Slate Brown" → "slate-brown", "slate_brown"
      let transformations = [optionLower];
      if (optionLower.includes(" ")) {
        transformations.push(optionLower.replace(/\s+/g, "-")); // space → dash
        transformations.push(optionLower.replace(/\s+/g, "_")); // space → underscore
      }

      // Check each transformation against the filename
      for (let transformed of transformations) {
        if (
          nameWithoutExt.startsWith(`${transformed}_`) ||
          nameWithoutExt.startsWith(`${transformed}-`) ||
          nameWithoutExt.endsWith(`_${transformed}`) ||
          nameWithoutExt.endsWith(`-${transformed}`) ||
          nameWithoutExt.endsWith(transformed)
        ) {
          return optionLower;
        }
      }
    }
    return null;
  } catch {
    return null;
  }
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
}: VariantGroupedMediaParams): VariantGroupedMediaResult {
  // 1. Find the selected option value for the grouping option
  let selectedOptionValue = selectedVariant.selectedOptions.find(
    (opt) => opt.name === groupByOption,
  )?.value;

  if (!selectedOptionValue) {
    return { media: allMedia, isGrouped: false };
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
      groupedMedia.get(optionValue)?.push(media);
    } else {
      ungrouped.push(media);
    }
  }

  // 4. Get matched media for selected option value
  let matched = groupedMedia.get(selectedOptionValueLower) || [];

  // 5. Fallback: if no matches, show all media
  if (matched.length === 0) {
    return { media: allMedia, isGrouped: false };
  }

  return { media: [...matched, ...ungrouped], isGrouped: true };
}
