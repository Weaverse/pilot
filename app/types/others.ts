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

export type ImageAspectRatio = "adapt" | "1/1" | "4/3" | "3/4" | "16/9";

export type CartLayoutType = "page" | "drawer";
