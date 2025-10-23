import type { I18nBase } from "@shopify/hydrogen";
import type {
  CurrencyCode,
  ProductFilter,
} from "@shopify/hydrogen/storefront-api-types";

export type Localizations = Record<string, I18nLocale>;

export type I18nLocale = I18nBase & {
  currency: CurrencyCode;
  label: string;
  pathPrefix?: string;
};

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
