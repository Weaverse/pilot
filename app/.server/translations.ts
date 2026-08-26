import ar from "~/i18n/ar.json" with { type: "json" };
import de from "~/i18n/de.json" with { type: "json" };
import es from "~/i18n/es.json" with { type: "json" };
import fr from "~/i18n/fr.json" with { type: "json" };
import hi from "~/i18n/hi.json" with { type: "json" };
import it from "~/i18n/it.json" with { type: "json" };
import ja from "~/i18n/ja.json" with { type: "json" };
import zh from "~/i18n/zh.json" with { type: "json" };
import type { Locale } from "~/utils/locale";

type Translations = Record<string, unknown>;

/**
 * Theme-shipped translations, keyed by the market's Shopify language code
 * lowercased.
 *
 * English is deliberately absent: `en.json` is already sent as
 * `themeSchema.i18n.staticContent`, which the SDK reads whenever a key has no
 * override. Bundling it again would duplicate the whole file in the payload of
 * every English market (`en-US`, `en-GB`, `en-IN`, `en-AE`).
 */
const BUNDLED: Record<string, Translations> = {
  ar,
  de,
  es,
  fr,
  hi,
  it,
  ja,
  zh,
};

/**
 * Merges `overrides` onto `base`, recursing into nested groups.
 *
 * A shallow merge would be wrong: the SDK reads translations per dot-path, so
 * replacing a whole group (`{ cart: { title } }`) would drop every sibling key
 * in that group back to the English source.
 *
 * `__proto__` is skipped because assigning it on a plain object mutates the
 * prototype chain rather than adding a key.
 */
function deepMerge(base: Translations, overrides: Translations): Translations {
  const merged: Translations = { ...base };
  for (const [key, value] of Object.entries(overrides)) {
    if (key === "__proto__") {
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
 * Active-market translations for the root loader's `weaverseTheme` payload.
 *
 * The SDK only fetches *merchant* translations from the Weaverse API, so
 * without this a project with nothing published in the Translation Manager
 * would render English in every market. Theme-shipped copy is the baseline;
 * anything the merchant publishes wins over it, key by key.
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
