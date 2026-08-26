import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import {
  DEFAULT_LOCALE,
  delocalizePath,
  localizePath,
  resolveLocale,
  SUPPORTED_LOCALES,
} from "../../app/utils/locale";

test("every configured market is internally consistent", () => {
  const seenPrefixes = new Set<string>();
  const seenHreflang = new Set<string>();

  for (const locale of SUPPORTED_LOCALES) {
    expect(seenPrefixes.has(locale.pathPrefix)).toBe(false);
    seenPrefixes.add(locale.pathPrefix);

    expect(seenHreflang.has(locale.hreflang)).toBe(false);
    seenHreflang.add(locale.hreflang);

    // The prefix is the URL contract; it must be derivable from the locale
    // identity so a market can never be reachable under a path that disagrees
    // with the language/country it sets on the Storefront API.
    if (locale !== DEFAULT_LOCALE) {
      expect(locale.pathPrefix).toBe(
        `/${locale.language.toLowerCase()}-${locale.country.toLowerCase()}`,
      );
    }
    expect(locale.hreflang).toBe(
      `${locale.language.toLowerCase()}-${locale.country}`,
    );
    expect(locale.direction === "ltr" || locale.direction === "rtl").toBe(true);
  }
});

test("the default market owns the unprefixed root", () => {
  expect(DEFAULT_LOCALE.pathPrefix).toBe("");
  expect(SUPPORTED_LOCALES).toContain(DEFAULT_LOCALE);
  expect(
    SUPPORTED_LOCALES.filter((locale) => locale.pathPrefix === "").length,
  ).toBe(1);
});

function marketFor(hreflang: string) {
  return SUPPORTED_LOCALES.find((locale) => locale.hreflang === hreflang);
}

test("ships the markets required for the pilot.weaverse.dev rollout", () => {
  for (const hreflang of [
    "en-US",
    "hi-IN",
    "ar-AE",
    "es-ES",
    "fr-FR",
    "de-DE",
  ]) {
    expect(marketFor(hreflang)).toBeTruthy();
  }

  expect(marketFor("ar-AE")?.direction).toBe("rtl");
  expect(marketFor("hi-IN")?.currency).toBe("INR");
});

test("resolves the locale from a pathname", () => {
  expect(resolveLocale("/hi-in/products/hoodie").hreflang).toBe("hi-IN");
  expect(resolveLocale("/products/hoodie")).toBe(DEFAULT_LOCALE);
  expect(resolveLocale("/")).toBe(DEFAULT_LOCALE);
  expect(resolveLocale("")).toBe(DEFAULT_LOCALE);
});

test("resolves the locale case-insensitively", () => {
  expect(resolveLocale("/HI-IN/products/hoodie").hreflang).toBe("hi-IN");
  expect(resolveLocale("/Hi-In").hreflang).toBe("hi-IN");
});

test("strips React Router's single-fetch .data suffix", () => {
  expect(resolveLocale("/de-de.data").hreflang).toBe("de-DE");
  expect(resolveLocale("/de-de/products/hoodie.data").hreflang).toBe("de-DE");
});

test("falls back to the default market for unsupported locales", () => {
  // A locale-shaped segment for a market we do not sell in must not silently
  // become a 200 at a non-canonical URL for the default market's content.
  expect(resolveLocale("/en-xx/products/hoodie")).toBe(DEFAULT_LOCALE);
  expect(resolveLocale("/zz-zz")).toBe(DEFAULT_LOCALE);
});

test("never mistakes a content path for a locale prefix", () => {
  expect(resolveLocale("/collections/hi-in-specials")).toBe(DEFAULT_LOCALE);
  expect(resolveLocale("/products/de-de")).toBe(DEFAULT_LOCALE);
  // A path that merely *starts with* the prefix text is a different route.
  expect(resolveLocale("/hi-india/products")).toBe(DEFAULT_LOCALE);
});

test("localizes a path for the active market", () => {
  const hiIN = resolveLocale("/hi-in");

  expect(localizePath("/products/hoodie", hiIN)).toBe("/hi-in/products/hoodie");
  expect(localizePath("/", hiIN)).toBe("/hi-in");
  expect(localizePath("products/hoodie", hiIN)).toBe("/hi-in/products/hoodie");
  expect(localizePath("/products/hoodie", DEFAULT_LOCALE)).toBe(
    "/products/hoodie",
  );
  expect(localizePath("/", DEFAULT_LOCALE)).toBe("/");
});

test("localizing is idempotent", () => {
  const deDE = resolveLocale("/de-de");
  const once = localizePath("/cart", deDE);

  expect(localizePath(once, deDE)).toBe(once);
});

test("localizing preserves the query string", () => {
  const frFR = resolveLocale("/fr-fr");

  expect(localizePath("/search?q=hoodie&sort=price", frFR)).toBe(
    "/fr-fr/search?q=hoodie&sort=price",
  );
});

test("delocalizes a path back to a market-neutral one", () => {
  expect(delocalizePath("/hi-in/products/hoodie")).toBe("/products/hoodie");
  expect(delocalizePath("/hi-in")).toBe("/");
  expect(delocalizePath("/hi-in/")).toBe("/");
  expect(delocalizePath("/products/hoodie")).toBe("/products/hoodie");
  expect(delocalizePath("/")).toBe("/");
});

test("delocalizing only strips a leading segment", () => {
  // Regression: an unanchored `pathname.replace(prefix, "")` corrupts any path
  // that contains the prefix text further along.
  expect(delocalizePath("/collections/hi-in-specials")).toBe(
    "/collections/hi-in-specials",
  );
  expect(delocalizePath("/de-de/collections/de-de-picks")).toBe(
    "/collections/de-de-picks",
  );
});

test("switching markets preserves the path and query", () => {
  const arAE = resolveLocale("/ar-ae");
  const current = "/hi-in/collections/summer?sort=price&page=2";

  expect(localizePath(delocalizePath(current), arAE)).toBe(
    "/ar-ae/collections/summer?sort=price&page=2",
  );
  expect(localizePath(delocalizePath(current), DEFAULT_LOCALE)).toBe(
    "/collections/summer?sort=price&page=2",
  );
});

test("round-trips every market through localize and delocalize", () => {
  for (const locale of SUPPORTED_LOCALES) {
    expect(delocalizePath(localizePath("/products/hoodie", locale))).toBe(
      "/products/hoodie",
    );
    expect(delocalizePath(localizePath("/", locale))).toBe("/");
  }
});

test("a storefront redirect keeps the shopper on their market", async () => {
  const server = await readFile(
    new URL("../../server.ts", import.meta.url),
    "utf8",
  );

  // Shopify stores URL redirects on market-neutral paths and matches the
  // request path verbatim, so `/de-de/collections/all` would 404 while
  // `/collections/all` redirects. The lookup must be delocalized and the
  // target relocalized.
  expect(server).toContain("delocalizePath");
  expect(server).toContain("localizePath");
  // A second Location header would be comma-joined into an invalid URL.
  expect(server).not.toMatch(/Location:\s*localized/);
});
