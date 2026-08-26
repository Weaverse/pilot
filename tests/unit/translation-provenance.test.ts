import { expect, test } from "@playwright/test";
import { localizedThemePayload } from "../../app/.server/translations";
import staticContent from "../../app/i18n/en.json" with { type: "json" };
import { legacyThemeText } from "../../app/utils/legacy-theme-text";
import { resolveLocale } from "../../app/utils/locale";

/**
 * The payload `app/.server/root.ts` puts on `weaverseTheme`, which the SDK
 * splits into `staticContent` and `merchantOverrides` for `TranslationProvider`.
 *
 * `merchantOverrides` must carry only what the merchant published: it is the
 * provenance signal `legacyThemeText` reads to decide whether a saved
 * pre-migration setting is still the merchant's current intent.
 */
type ThemePayload = {
  staticContent: Record<string, unknown>;
  merchantOverrides: Record<string, unknown> | undefined;
};

function themePayload(
  pathname: string,
  published: Record<string, unknown>,
): ThemePayload {
  const locale = resolveLocale(pathname);

  // The exact payload `app/.server/root.ts` sends, so the split between theme
  // copy and merchant provenance is the production one.
  return localizedThemePayload(
    { staticContent, merchantOverrides: published },
    locale,
  ) as ThemePayload;
}

/** What the shopper actually sees for `key`. */
function rendered(
  key: string,
  payload: ThemePayload,
  settings: Record<string, unknown>,
): string {
  const legacy = legacyThemeText(key, settings, payload.merchantOverrides);
  if (legacy !== null) {
    return legacy;
  }
  const fromOverrides = key
    .split(".")
    .reduce<unknown>(
      (node, part) => (node as Record<string, unknown>)?.[part],
      payload.merchantOverrides,
    );
  if (typeof fromOverrides === "string") {
    return fromOverrides;
  }

  return key
    .split(".")
    .reduce<unknown>(
      (node, part) => (node as Record<string, unknown>)?.[part],
      payload.staticContent,
    ) as string;
}

/** An existing storefront: saved theme copy, nothing published in the manager. */
const SAVED = {
  storeEmail: "merchant@example.test",
  copyright: "© Merchant 2026",
  topbarText: "<p>Merchant sale</p>",
};

test("a merchant's saved footer email survives in a non-English market", () => {
  // The German bundle ships `contact@my-store.com`. Presenting it as a merchant
  // override makes `legacyThemeText` think the merchant published it, so the
  // real address is discarded and demo copy goes live.
  const payload = themePayload("/de-de/products/hoodie", {});

  expect(rendered("footer.storeEmail", payload, SAVED)).toBe(
    "merchant@example.test",
  );
});

test("a merchant's saved copyright survives in a non-English market", () => {
  const payload = themePayload("/de-de/products/hoodie", {});

  expect(rendered("footer.copyright", payload, SAVED)).toBe("© Merchant 2026");
});

test("a merchant's saved announcement survives in a non-English market", () => {
  const payload = themePayload("/de-de/products/hoodie", {});

  expect(rendered("announcement.topbarText", payload, SAVED)).toBe(
    "<p>Merchant sale</p>",
  );
});

test("a real published translation still outranks saved legacy copy", () => {
  // Publishing in the Translation Manager is the merchant's current intent, so
  // it must win — this is the precedence the bundle was masking.
  const payload = themePayload("/de-de/products/hoodie", {
    footer: { storeEmail: "hallo@example.test" },
  });

  expect(rendered("footer.storeEmail", payload, SAVED)).toBe(
    "hallo@example.test",
  );
});

test("an explicitly published empty value is authoritative", () => {
  // A merchant who cleared the string in the manager wants it gone. Requiring a
  // non-empty override treats that as absent and resurrects legacy copy.
  const payload = themePayload("/de-de/products/hoodie", {
    footer: { storeEmail: "" },
  });

  expect(rendered("footer.storeEmail", payload, SAVED)).toBe("");
});

test("a fresh install still gets the market's translated copy", () => {
  // Nothing saved, nothing published: the theme's own German bundle applies.
  const payload = themePayload("/de-de/products/hoodie", {});

  expect(rendered("footer.newsletterTitle", payload, {})).toBe(
    "BLEIBEN SIE IN KONTAKT",
  );
});

test("bundled copy is never mistaken for merchant provenance", () => {
  // The direct statement of the defect: a market with a theme bundle and no
  // published overrides has published nothing at all.
  const payload = themePayload("/de-de/products/hoodie", {});

  expect(payload.merchantOverrides ?? {}).toEqual({});
});
