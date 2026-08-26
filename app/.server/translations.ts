import ar from "~/i18n/ar.json" with { type: "json" };
import de from "~/i18n/de.json" with { type: "json" };
import es from "~/i18n/es.json" with { type: "json" };
import fr from "~/i18n/fr.json" with { type: "json" };
import hi from "~/i18n/hi.json" with { type: "json" };
import it from "~/i18n/it.json" with { type: "json" };
import ja from "~/i18n/ja.json" with { type: "json" };
import zh from "~/i18n/zh.json" with { type: "json" };
import zhTw from "~/i18n/zh-tw.json" with { type: "json" };
import { bundleLocaleFor, type Locale } from "~/utils/locale";

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
  // Traditional script for `zh-HK` and `zh-TW`; `zh` is Simplified.
  "zh-tw": zhTw,
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
 * The theme's own copy for the active market: `en.json` with that market's
 * bundle layered on top.
 *
 * This is `staticContent`, not `merchantOverrides`. The SDK resolves a key as
 * `override ?? staticValue`, and `merchantOverrides` is also the provenance
 * signal {@link legacyThemeText} reads to decide whether a merchant has
 * published a string. Passing theme-shipped copy as an override tells every
 * consumer the merchant published demo text they have never seen, which
 * discards their saved pre-migration copy in every non-English market.
 *
 * English is the source language, so a market with no bundle keeps `source`
 * unchanged; a partial bundle falls back to English key by key.
 */
export function resolveThemeContent(
  locale: Locale,
  source: Translations | undefined,
): Translations | undefined {
  // Keyed by the market's bundle locale, never the provider enum: `ZH_CN` is
  // not a bundle name, and `zh-TW` needs Traditional rather than Simplified.
  const bundled = BUNDLED[bundleLocaleFor(locale)];
  if (!bundled) {
    return source;
  }
  return source ? deepMerge(source, bundled) : bundled;
}

/**
 * The `weaverseTheme` payload the root loader sends to the client.
 *
 * The SDK splits this into `TranslationProvider`'s two inputs and resolves a
 * key as `override ?? staticValue`, so the split decides provenance:
 * `staticContent` is theme-owned copy for the active market, `merchantOverrides`
 * is only what the merchant published. Collapsing the two makes bundled demo
 * text look merchant-published and discards saved pre-migration copy.
 */
export function localizedThemePayload<
  T extends {
    staticContent?: Translations;
    merchantOverrides?: Translations;
  },
>(theme: T, locale: Locale): T {
  return {
    ...theme,
    staticContent: resolveThemeContent(locale, theme.staticContent),
    merchantOverrides: theme.merchantOverrides,
  };
}
