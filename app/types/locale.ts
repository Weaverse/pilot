import type { I18nBase } from "@shopify/hydrogen";
import type { CurrencyCode } from "@shopify/hydrogen/storefront-api-types";

export type Localizations = Record<string, I18nLocale>;

export type I18nLocale = I18nBase & {
  currency: CurrencyCode;
  label: string;
  pathPrefix?: string;
};
