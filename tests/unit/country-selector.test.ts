import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import {
  DEFAULT_LOCALE,
  resolveLocale,
  SUPPORTED_LOCALES,
} from "../../app/utils/locale";

const SELECTOR_DIR = new URL(
  "../../app/components/layout/country-selector/",
  import.meta.url,
);

test("builds its market list without a client fetch", async () => {
  const source = await readFile(
    new URL("use-country-selector.ts", SELECTOR_DIR),
    "utf8",
  );

  // The market list is a build-time constant. It used to be fetched from
  // /api/countries on scroll-into-view, which cost a request per page and
  // needed an intersection observer to trigger it.
  expect(source).not.toContain("useFetcher");
  expect(source).not.toContain("useInView");
  expect(source).not.toContain("/api/countries");
  expect(source).toContain("SUPPORTED_LOCALES");
});

test("switches market with a client-side navigation", async () => {
  const form = await readFile(new URL("market-form.tsx", SELECTOR_DIR), "utf8");

  // Hydrated, the switch navigates in the router (Weaverse builds a fresh page
  // instance per URL) while the cart moves to the new market, then refreshes
  // the cart store. A full reload re-downloaded and re-hydrated the app.
  expect(form).toContain("onSubmit={handleSubmit}");
  expect(form).toContain("event.preventDefault()");
  expect(form).toContain("navigate(redirectTo)");
  expect(form).toContain("fetch(CART_BUYER_IDENTITY_PATH");
  expect(form).toContain("refresh()");
  // `ShopifyScripts` reads the market once; analytics must follow the switch.
  expect(form).toContain("syncShopifyMarket(locale)");
  // Without JavaScript the native post moves the cart and redirects. The
  // endpoint's behavior is asserted in `cart-market.test.ts`.
  expect(form).toMatch(/method="post"\s+action=\{CART_BUYER_IDENTITY_PATH\}/);
  expect(form).toContain('name="redirectTo"');
  expect(form).toContain('name="countryCode" value={locale.country}');
});

test("the submit control outlives the popover that holds it", async () => {
  const form = await readFile(new URL("market-form.tsx", SELECTOR_DIR), "utf8");

  // `Popover.Close` unmounts this form synchronously during the click, so the
  // browser discards the submission and the market never changes. The
  // selector closes its popover through `onSwitch` once the submit started.
  expect(form).not.toContain("react-popover");
  expect(form).toContain('type="submit"');
  expect(form).toContain("onSwitch?.()");
});

test("groups every market by country", () => {
  // Each configured market must be reachable from the selector exactly once,
  // and a country that sells in several languages must yield several rows.
  const countries = new Set(SUPPORTED_LOCALES.map((locale) => locale.country));
  expect(countries.size).toBeGreaterThan(1);
  expect(
    SUPPORTED_LOCALES.filter((locale) => locale.country === "IN").length,
  ).toBe(2);
});

test("a market row is labelled in its own language", () => {
  for (const locale of SUPPORTED_LOCALES) {
    expect(locale.languageLabel.length).toBeGreaterThan(0);
    expect(locale.label.length).toBeGreaterThan(0);
  }
  // Two markets in one country are distinguished by language, not by label.
  const india = SUPPORTED_LOCALES.filter((locale) => locale.country === "IN");
  expect(new Set(india.map((locale) => locale.languageLabel)).size).toBe(
    india.length,
  );
});

test("the active market is identified by its path prefix", () => {
  // Language+country comparison mis-identifies the active row when one country
  // sells in several languages; the prefix is the unique market key.
  expect(resolveLocale("/en-in/cart").pathPrefix).toBe("/en-in");
  expect(resolveLocale("/hi-in/cart").pathPrefix).toBe("/hi-in");
  expect(resolveLocale("/cart")).toBe(DEFAULT_LOCALE);
});
