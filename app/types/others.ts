import type { ProductFilter } from "@shopify/hydrogen/storefront-api-types";

export type AppliedFilter = {
  label: string;
  filter: ProductFilter;
};

export type SortParam =
  | "price-low-high"
  | "price-high-low"
  | "best-selling"
  | "newest"
  | "featured"
  | "relevance";
