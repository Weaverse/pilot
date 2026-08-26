import type { ProductCollectionSortKeys } from "@shopify/hydrogen/storefront-api-types";
import type { SortParam } from "~/types/others";
import type { Locale } from "~/utils/locale";

export function getSortValuesFromParam(sortParam: SortParam | null): {
  sortKey: ProductCollectionSortKeys;
  reverse: boolean;
} {
  switch (sortParam) {
    case "price-high-low":
      return { sortKey: "PRICE", reverse: true };
    case "price-low-high":
      return { sortKey: "PRICE", reverse: false };
    case "best-selling":
      return { sortKey: "BEST_SELLING", reverse: false };
    case "newest":
      return { sortKey: "CREATED", reverse: true };
    case "featured":
      return { sortKey: "MANUAL", reverse: false };
    default:
      return { sortKey: "RELEVANCE", reverse: false };
  }
}

export function parseAsCurrency(value: number, locale: Locale) {
  // `hreflang`, not `language`: the provider code can be script-specific
  // (`ZH_CN`), which is not a BCP-47 tag and makes `Intl` throw.
  return new Intl.NumberFormat(locale.hreflang, {
    style: "currency",
    currency: locale.currency,
  }).format(value);
}
