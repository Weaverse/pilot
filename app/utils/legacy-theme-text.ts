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
  // Merchandising copy. These settings were renamed to translation keys by the
  // migration, orphaning the values every upgraded storefront already has —
  // badge wording and the quick-shop CTA are customer-visible conversion copy.
  "badge.bestSeller": "bestSellerBadgeText",
  "badge.new": "newBadgeText",
  "badge.bundle": "bundleBadgeText",
  "badge.soldOut": "soldOutBadgeText",
  "badge.sale": "saleBadgeText",
  "product.quickShop": "pcardQuickShopButtonText",
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
 * The English `defaultValue` each legacy setting shipped with, taken from the
 * schema at the release before the Translation Manager migration.
 *
 * Every one of these settings had a default, so an upgraded storefront carries
 * the value whether or not the merchant ever opened the field. A persisted
 * value equal to what the theme shipped is not a choice — treating it as one
 * would pin English copy into every localized market and undo the migration.
 * Anything that differs, including an empty string, is the merchant's own.
 */
const SHIPPED_DEFAULT_FOR_SETTING: Record<string, string> = {
  bestSellerBadgeText: "Best Seller",
  newBadgeText: "New",
  bundleBadgeText: "Bundle",
  soldOutBadgeText: "Sold out",
  saleBadgeText: "-[percentage]% Off",
  pcardQuickShopButtonText: "Quick shop",
  bio: "<p>We are a team of designers, developers, and creatives who are passionate about creating beautiful and functional products.</p>",
  addressTitle: "OUR SHOP",
  storeAddress: "301 Front St W, Toronto, ON M5V 2T6, Canada",
  storeEmail: "contact@my-store.com",
  newsletterTitle: "STAY IN TOUCH",
  newsletterDescription: "News and inspiration in your inbox, every week.",
  newsletterPlaceholder: "Please enter your email",
  newsletterButtonText: "Subscribe",
  copyright: "© 2024 Weaverse. All rights reserved.",
  topbarText:
    "<p>Free shipping on orders over $50</p><p>New arrivals dropping every week</p><p>30-day hassle-free returns</p><p>Sign up and get 10% off your first order</p>",
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
  // Presence, not truthiness: a merchant who cleared the string in the
  // Translation Manager published an empty value, and that is current intent.
  // Requiring a non-empty override treats it as absent and resurrects the
  // pre-migration copy they deliberately removed.
  const published = merchantOverrides
    ? getNestedKey(merchantOverrides, key)
    : undefined;
  if (typeof published === "string") {
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
  if (typeof legacy !== "string") {
    return null;
  }

  // Presence is proven; an empty string is a deliberate clear and is kept. A
  // value still identical to the shipped default was never edited, so the
  // market's translation applies instead.
  return legacy === SHIPPED_DEFAULT_FOR_SETTING[legacyName] ? null : legacy;
}

/**
 * Copy for a merchant-configurable control, given the value a component was
 * passed and the theme's own reader.
 *
 * A prop wins because it is an explicit merchant setting forwarded by the
 * caller; `undefined` means the caller has nothing to say and the translated
 * copy applies. A shipped default reaching a component is filtered out first,
 * so the market's translation is not suppressed by copy no merchant chose.
 */
export function controlCopy(
  value: string | undefined,
  setting: string,
  translated: (key: string) => string,
  key: string,
): string {
  if (value === undefined || value === SHIPPED_DEFAULT_FOR_SETTING[setting]) {
    return translated(key);
  }

  return value;
}
