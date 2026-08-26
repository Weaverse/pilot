import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import staticContent from "../../app/i18n/en.json" with { type: "json" };
import {
  controlCopy,
  legacyThemeText,
} from "../../app/utils/legacy-theme-text";

type PreUpgrade = { settings: Record<string, unknown> };

/** Theme settings a live storefront carries after upgrading from the base. */
async function preUpgradeSettings(): Promise<Record<string, unknown>> {
  const fixture = JSON.parse(
    await readFile(
      new URL("./fixtures/pre-upgrade-theme-settings.json", import.meta.url),
      "utf8",
    ),
  ) as PreUpgrade;

  return fixture.settings;
}

/**
 * What a component renders for `key`: the merchant's persisted value when they
 * have one, otherwise the theme's translated copy.
 *
 * This is the shared boundary — badges, the quick-shop trigger and the footer
 * all resolve copy the same way, so a per-component fix would leave siblings
 * broken.
 */
function themeCopy(
  key: string,
  settings: Record<string, unknown>,
  merchantOverrides: Record<string, unknown> | null = null,
): string {
  const legacy = legacyThemeText(key, settings, merchantOverrides);
  if (legacy !== null) {
    return legacy;
  }

  // The SDK resolves a key as `override ?? staticValue`; `legacyThemeText`
  // stands down whenever the merchant published one, so read it here.
  const read = (source: unknown) =>
    key
      .split(".")
      .reduce<unknown>(
        (node, part) => (node as Record<string, unknown>)?.[part],
        source,
      );
  const published = read(merchantOverrides);

  return (
    typeof published === "string" ? published : read(staticContent)
  ) as string;
}

test("persisted badge copy survives the upgrade", async () => {
  // A merchant who renamed their badges keeps seeing their own words; the
  // migration renamed the setting keys, so these values were orphaned.
  const settings = await preUpgradeSettings();

  expect({
    bestSeller: themeCopy("badge.bestSeller", settings),
    new: themeCopy("badge.new", settings),
    bundle: themeCopy("badge.bundle", settings),
    soldOut: themeCopy("badge.soldOut", settings),
    sale: themeCopy("badge.sale", settings),
  }).toEqual({
    bestSeller: "Kundenliebling",
    new: "Neu eingetroffen",
    bundle: "Set",
    soldOut: "Ausverkauft",
    sale: "-[percentage]% reduziert",
  });
});

test("the persisted quick-shop trigger label survives the upgrade", async () => {
  const settings = await preUpgradeSettings();

  expect(themeCopy("product.quickShop", settings)).toBe("Schnellansicht");
});

test("the sale badge keeps its interpolation token", async () => {
  // `[percentage]` is substituted at render time; losing it would print the
  // literal token or an empty discount.
  const settings = await preUpgradeSettings();

  expect(themeCopy("badge.sale", settings)).toContain("[percentage]");
});

test("a fresh install uses the theme's translated badge copy", () => {
  // No persisted settings: nothing to preserve, so translations apply.
  expect({
    bestSeller: themeCopy("badge.bestSeller", {}),
    quickShop: themeCopy("product.quickShop", {}),
  }).toEqual({
    bestSeller: staticContent.badge.bestSeller,
    quickShop: staticContent.product.quickShop,
  });
});

test("a published translation outranks persisted badge copy", async () => {
  // Editing the string in the Translation Manager is the merchant's current
  // intent and must win, exactly as it does for footer copy.
  const settings = await preUpgradeSettings();

  expect(
    themeCopy("badge.bestSeller", settings, {
      badge: { bestSeller: "Top pick" },
    }),
  ).toBe("Top pick");
});

test("a cleared badge setting stays cleared", async () => {
  // Emptying the field is a deliberate choice: the badge should carry no text
  // rather than silently revert to the theme default.
  const settings = { ...(await preUpgradeSettings()), bestSellerBadgeText: "" };

  expect(themeCopy("badge.bestSeller", settings)).toBe("");
});

test("no badge or quick-shop setting is left dead in the editor", async () => {
  // Every persisted key the fixture carries must map to a translation key, or
  // the editor still shows a field that changes nothing.
  const { LEGACY_SETTING_FOR_KEY } = await import(
    "../../app/utils/legacy-theme-text"
  );
  const mapped = new Set(Object.values(LEGACY_SETTING_FOR_KEY));

  for (const setting of [
    "bestSellerBadgeText",
    "newBadgeText",
    "bundleBadgeText",
    "soldOutBadgeText",
    "saleBadgeText",
    "pcardQuickShopButtonText",
  ]) {
    expect({ setting, mapped: mapped.has(setting) }).toEqual({
      setting,
      mapped: true,
    });
  }
});

test("an untouched shipped default does not suppress translation", async () => {
  // Every one of these settings shipped an English `defaultValue`, so an
  // upgraded storefront has it persisted whether or not the merchant ever
  // opened the field. Treating that as merchant intent pins English copy into
  // every localized market — the migration's whole purpose, undone.
  const untouched = {
    bestSellerBadgeText: "Best Seller",
    pcardQuickShopButtonText: "Quick shop",
    copyright: "© 2024 Weaverse. All rights reserved.",
    storeEmail: "contact@my-store.com",
  };

  expect({
    bestSeller: legacyThemeText("badge.bestSeller", untouched, null),
    quickShop: legacyThemeText("product.quickShop", untouched, null),
    copyright: legacyThemeText("footer.copyright", untouched, null),
    storeEmail: legacyThemeText("footer.storeEmail", untouched, null),
  }).toEqual({
    // `null` means "use the translation for this market".
    bestSeller: null,
    quickShop: null,
    copyright: null,
    storeEmail: null,
  });
});

test("a merchant's edit is preserved even when it looks ordinary", async () => {
  // The mirror image: anything that differs from the shipped default is a real
  // choice and must survive, including a single-character change.
  expect({
    edited: legacyThemeText(
      "badge.bestSeller",
      { bestSellerBadgeText: "Best seller" },
      null,
    ),
    cleared: legacyThemeText(
      "badge.bestSeller",
      { bestSellerBadgeText: "" },
      null,
    ),
    translated: legacyThemeText(
      "footer.storeEmail",
      { storeEmail: "hallo@example.test" },
      null,
    ),
  }).toEqual({
    edited: "Best seller",
    cleared: "",
    translated: "hallo@example.test",
  });
});

test("the quick-shop trigger prefers a forwarded merchant label", () => {
  // `ProductCard` forwards `pcardQuickShopButtonText`; the trigger must use it
  // rather than a hardcoded English literal. The shipped default is filtered so
  // an untouched storefront still gets its market's translation.
  const translated = (key: string) =>
    key === "product.quickShop" ? "Schnellansicht (übersetzt)" : key;

  expect({
    merchantEdit: controlCopy(
      "Schnellansicht",
      "pcardQuickShopButtonText",
      translated,
      "product.quickShop",
    ),
    untouchedDefault: controlCopy(
      "Quick shop",
      "pcardQuickShopButtonText",
      translated,
      "product.quickShop",
    ),
    notForwarded: controlCopy(
      undefined,
      "pcardQuickShopButtonText",
      translated,
      "product.quickShop",
    ),
    cleared: controlCopy(
      "",
      "pcardQuickShopButtonText",
      translated,
      "product.quickShop",
    ),
  }).toEqual({
    merchantEdit: "Schnellansicht",
    untouchedDefault: "Schnellansicht (übersetzt)",
    notForwarded: "Schnellansicht (übersetzt)",
    cleared: "",
  });
});

test("every merchant-configurable surface resolves copy the same way", async () => {
  // Badges, the quick-shop trigger and footer copy are one boundary. A fix
  // applied to a single component would leave the siblings regressed, so pin
  // that they all resolve through the shared map.
  const settings = await preUpgradeSettings();
  const { LEGACY_SETTING_FOR_KEY } = await import(
    "../../app/utils/legacy-theme-text"
  );

  for (const key of [
    "badge.bestSeller",
    "badge.new",
    "badge.bundle",
    "badge.soldOut",
    "badge.sale",
    "product.quickShop",
    "footer.copyright",
  ]) {
    expect({ key, mapped: key in LEGACY_SETTING_FOR_KEY }).toEqual({
      key,
      mapped: true,
    });
  }

  // And a persisted value actually reaches the reader for each of them.
  expect(themeCopy("badge.soldOut", settings)).toBe("Ausverkauft");
  expect(themeCopy("product.quickShop", settings)).toBe("Schnellansicht");
});
