import ar from "~/i18n/ar.json" with { type: "json" };
import de from "~/i18n/de.json" with { type: "json" };
import en from "~/i18n/en.json" with { type: "json" };
import es from "~/i18n/es.json" with { type: "json" };
import fr from "~/i18n/fr.json" with { type: "json" };
import hi from "~/i18n/hi.json" with { type: "json" };
import type { Locale } from "~/utils/locale";

type Translations = Record<string, unknown>;

/**
 * Theme-shipped translations, keyed by the market's Shopify language code
 * lowercased. `en` is the source language and also lives in
 * `themeSchema.i18n.staticContent`.
 */
const BUNDLED: Record<string, Translations> = { ar, de, en, es, fr, hi };

/**
 * Merges `overrides` onto `base`, recursing into nested groups.
 *
 * A shallow merge would be wrong: `merchantOverrides` is read per dot-path, so
 * replacing a whole group (`{ cart: { title } }`) would hide every sibling key
 * in that group that the merchant has not translated.
 *
 * Keys are assigned with `Object.defineProperty`-free plain assignment onto a
 * null-prototype-safe target: `__proto__` and friends are skipped so a
 * merchant-controlled key cannot reach `Object.prototype`.
 */
function deepMerge(base: Translations, overrides: Translations): Translations {
  const merged: Translations = { ...base };
  for (const [key, value] of Object.entries(overrides)) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      continue;
    }
    const existing = merged[key];
    merged[key] =
      value && typeof value === "object" && !Array.isArray(value)
        ? deepMerge(
            existing && typeof existing === "object" && !Array.isArray(existing)
              ? (existing as Translations)
              : {},
            value as Translations,
          )
        : value;
  }
  return merged;
}

/**
 * Active-locale translations for the root loader's `weaverseTheme` payload.
 *
 * The SDK only fetches merchant translations from the Weaverse API, so without
 * this a storefront whose project has no published translations would render
 * English in every market. Theme-shipped copy is the baseline; anything the
 * merchant publishes in the Translation Manager wins over it, key by key.
 */
export function resolveTranslations(
  locale: Locale,
  merchantOverrides: Translations | undefined,
): Translations | undefined {
  const bundled = BUNDLED[locale.language.toLowerCase()];
  if (!bundled) {
    return merchantOverrides;
  }
  return merchantOverrides ? deepMerge(bundled, merchantOverrides) : bundled;
}
