import { getNestedKey } from "@weaverse/hydrogen";

/**
 * Legacy theme-setting name → the translation key that replaced it.
 *
 * Before the Translation Manager migration these strings lived in theme
 * settings, so an existing storefront has the merchant's own copy — a real
 * store address, contact email and copyright line — persisted under the old
 * names. The new keys resolve against bundled defaults, which are demo values
 * such as `contact@my-store.com`, so reading only the key would replace the
 * merchant's published contact and legal text with sample data on upgrade.
 */
export const LEGACY_SETTING_FOR_KEY: Record<string, string> = {
  "footer.bio": "bio",
  "footer.addressTitle": "addressTitle",
  "footer.storeAddress": "storeAddress",
  "footer.storeEmail": "storeEmail",
  "footer.newsletterTitle": "newsletterTitle",
  "footer.newsletterDescription": "newsletterDescription",
  "footer.newsletterPlaceholder": "newsletterPlaceholder",
  "footer.newsletterButtonText": "newsletterButtonText",
  "footer.copyright": "copyright",
  "announcement.topbarText": "topbarText",
};

/**
 * The merchant's pre-migration copy for `key`, or `null` when the translation
 * should be used instead.
 *
 * Precedence, highest first:
 * 1. A translation published in the Translation Manager — the merchant edited
 *    the string in the new system, so it is their current intent.
 * 2. The legacy theme setting, whenever the property is *present* — copy from
 *    before the migration, which must never be silently discarded.
 * 3. `null`, meaning fall through to the theme's bundled default.
 *
 * A present-but-empty legacy string is an intent, not an absence: a merchant
 * who cleared their store address or announcement wanted it gone. Treating it
 * as missing would fall through to (3) and republish bundled demo copy —
 * `contact@my-store.com`, a sample Toronto address — on their live storefront.
 * So presence is decided by the property, and emptiness is returned as `""`.
 *
 * Once a merchant edits the string in the Translation Manager, (1) wins and the
 * legacy value stops being consulted, so the fallback retires itself per key
 * with no migration step and no write to the merchant's data.
 */
export function legacyThemeText(
  key: string,
  settings: Record<string, unknown> | null | undefined,
  merchantOverrides: Record<string, unknown> | null | undefined,
): string | null {
  const published = merchantOverrides
    ? getNestedKey(merchantOverrides, key)
    : undefined;
  if (typeof published === "string" && published.length > 0) {
    return null;
  }
  const legacyName = LEGACY_SETTING_FOR_KEY[key];
  // Own-property, not `in`: an inherited `toString` is not a merchant setting.
  if (
    !(legacyName && settings && Object.hasOwn(settings as object, legacyName))
  ) {
    return null;
  }

  const legacy = settings[legacyName];

  // Presence is proven; only a string is usable copy. An empty one is a
  // deliberate clear and is returned as-is.
  return typeof legacy === "string" ? legacy : null;
}
