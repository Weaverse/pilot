// Edit these values to customize combined listings' behavior
export const COMBINED_LISTINGS_CONFIGS = {
  // If true, loading the product page will redirect to the first variant
  redirectToFirstVariant: false,
  // The tag that indicates a combined listing
  combinedListingTag: "combined",
  // If true, combined listings will not be shown in the product list
  hideCombinedListingsFromProductList: true,
};

export const maybeFilterOutCombinedListingsQuery =
  COMBINED_LISTINGS_CONFIGS.hideCombinedListingsFromProductList
    ? `NOT tag:${COMBINED_LISTINGS_CONFIGS.combinedListingTag}`
    : "";

interface ProductWithTags {
  tags: string[];
}

function isProductWithTags(u: unknown): u is ProductWithTags {
  const maybe = u as ProductWithTags;
  return (
    u != null &&
    typeof u === "object" &&
    "tags" in maybe &&
    Array.isArray(maybe.tags)
  );
}

export function isCombinedListing(product: unknown) {
  return (
    isProductWithTags(product) &&
    product.tags.includes(COMBINED_LISTINGS_CONFIGS.combinedListingTag)
  );
}
