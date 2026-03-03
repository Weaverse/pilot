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

    console.log("[VariantMedia] extractOptionValueFromUrl:", nameWithoutExt);

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

  // 2. Get all known option values from product.options
  let knownOptionValues: string[] = [];
  let matchingOption = product.options.find(
    (opt) => opt.name === groupByOption,
  );
  if (matchingOption) {
    knownOptionValues = matchingOption.optionValues.map((ov) => ov.name);
  }
  console.log("[VariantMedia] knownOptionValues:", knownOptionValues);

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
    console.log("[VariantMedia] media:", media.alt, "→ extracted:", optionValue);

    if (optionValue) {
      if (!groupedMedia.has(optionValue)) {
        groupedMedia.set(optionValue, []);
      }
      groupedMedia.get(optionValue)!.push(media);
    } else {
      ungrouped.push(media);
    }
  }

  console.log("[VariantMedia] groupedMedia keys:", Array.from(groupedMedia.keys()));
  console.log(
    "[VariantMedia] groupedMedia:",
    Object.fromEntries(
      Array.from(groupedMedia.entries()).map(([k, v]) => [k, v.length]),
    ),
  );

  // 4. Get matched media for selected option value
  let matched = groupedMedia.get(selectedOptionValueLower) || [];
  console.log("[VariantMedia] matched count for", selectedOptionValueLower, ":", matched.length);
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
