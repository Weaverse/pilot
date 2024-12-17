import type {
  Storefront as HydrogenStorefront,
  I18nBase,
} from "@shopify/hydrogen";
import type { CurrencyCode } from "@shopify/hydrogen/storefront-api-types";

export type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

export type Locale = I18nBase & {
  label: string;
  currency: CurrencyCode;
};

export type Localizations = Record<string, Locale>;

export type I18nLocale = Locale & {
  pathPrefix: string;
};

export type Storefront = HydrogenStorefront<I18nLocale>;

export type Alignment = "left" | "center" | "right";

export interface SingleMenuItem {
  id: string;
  title: string;
  items: SingleMenuItem[];
  to: string;
  resource?: {
    image?: {
      altText: string;
      height: number;
      id: string;
      url: string;
      width: number;
    };
  };
}
