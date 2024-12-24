import { COUNTRIES } from "~/data/countries";
import type { I18nLocale } from "~/types/locale";

export const PAGINATION_SIZE = 16;
export const FILTER_URL_PREFIX = "filter.";

export const DEFAULT_LOCALE: I18nLocale = Object.freeze({
  ...COUNTRIES.default,
  pathPrefix: "",
});
