import type { I18nBase } from "@shopify/hydrogen";
import type { CurrencyCode } from "@shopify/hydrogen/storefront-api-types";

export type Locale = I18nBase & {
  label: string;
  currency: CurrencyCode;
};

export type Localizations = Record<string, Locale>;

export type I18nLocale = Locale & {
  pathPrefix: string;
};
