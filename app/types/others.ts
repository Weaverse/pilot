import type { ProductFilter } from "@shopify/hydrogen";

export type AppliedFilter = {
  label: string;
  filter: ProductFilter;
};

export type ImageAspectRatio = "adapt" | "1/1" | "4/3" | "3/4" | "16/9";

export type CartLayoutType = "page" | "drawer";
