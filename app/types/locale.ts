import type { Locale } from "@weaverse/hydrogen";

export type Localizations = Record<string, Locale>;

export type I18nLocale = Locale & {
  pathPrefix: string;
};
