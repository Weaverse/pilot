import type { ProductCollectionSortKeys } from "@shopify/hydrogen/storefront-api-types";
import type { SortParam } from "./filter";

export let getSortValuesFromParam = (
  sortParam: SortParam | null,
): {
  sortKey: ProductCollectionSortKeys;
  reverse: boolean;
} => {
  switch (sortParam) {
    case "price-high-low":
      return {
        sortKey: "PRICE",
        reverse: true,
      };
    case "price-low-high":
      return {
        sortKey: "PRICE",
        reverse: false,
      };
    case "best-selling":
      return {
        sortKey: "BEST_SELLING",
        reverse: false,
      };
    case "newest":
      return {
        sortKey: "CREATED",
        reverse: true,
      };
    case "featured":
      return {
        sortKey: "MANUAL",
        reverse: false,
      };
    default:
      return {
        sortKey: "RELEVANCE",
        reverse: false,
      };
  }
};
