import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import {
  DEFAULT_LOCALE,
  delocalizePath,
  isUnsupportedMarketPath,
  localizedPathForRequest,
  localizePath,
  resolveLocale,
  SUPPORTED_LOCALES,
  unauthorizedRedirect,
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
  // The fallback exists so link, redirect and sitemap helpers never throw on a
  // malformed URL. Serving it to a visitor is a separate question, settled by
  // `isUnsupportedMarketPath` below.
  expect(resolveLocale("/en-xx/products/hoodie")).toBe(DEFAULT_LOCALE);
  expect(resolveLocale("/zz-zz")).toBe(DEFAULT_LOCALE);
});

test("refuses a market-shaped prefix we do not sell in", () => {
  // Serving the default market's page here would publish the whole catalogue
  // at an unbounded set of invented, non-canonical URLs.
  expect(isUnsupportedMarketPath("/en-xx")).toBe(true);
  expect(isUnsupportedMarketPath("/en-xx/products/hoodie")).toBe(true);
  expect(isUnsupportedMarketPath("/zz-zz/collections/all?sort=price")).toBe(
    true,
  );
  // Case-insensitive: an uppercase invented prefix is still invented.
  expect(isUnsupportedMarketPath("/EN-XX/products/hoodie")).toBe(true);
  // React Router single-fetch requests take the same path as the document.
  expect(isUnsupportedMarketPath("/en-xx/products/hoodie.data")).toBe(true);
});

test("serves every configured market and ordinary content path", () => {
  for (const locale of SUPPORTED_LOCALES) {
    expect(
      isUnsupportedMarketPath(`${locale.pathPrefix}/products/hoodie`),
    ).toBe(false);
    expect(isUnsupportedMarketPath(`${locale.pathPrefix}/cart.data`)).toBe(
      false,
    );
  }
  // The default market's own root and paths carry no prefix at all.
  expect(isUnsupportedMarketPath("/")).toBe(false);
  expect(isUnsupportedMarketPath("")).toBe(false);
  expect(isUnsupportedMarketPath("/products/hoodie")).toBe(false);
  // Root-level Weaverse custom pages are hyphenated but not market-shaped.
  expect(isUnsupportedMarketPath("/about-us")).toBe(false);
  expect(isUnsupportedMarketPath("/size-guide/womens")).toBe(false);
  // Only an exact `xx-yy` segment counts, so these stay routable.
  expect(isUnsupportedMarketPath("/hi-india/products")).toBe(false);
  expect(isUnsupportedMarketPath("/collections/hi-in-specials")).toBe(false);
  expect(isUnsupportedMarketPath("/products/de-de")).toBe(false);
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

test("the request boundary refuses unsupported markets", async () => {
  const server = await readFile(
    new URL("../../server.ts", import.meta.url),
    "utf8",
  );

  // The predicate is worthless unless the boundary actually calls it, and it
  // must run before `handleRequest` so no route can serve the invented URL.
  expect(server).toContain("isUnsupportedMarketPath");
  expect(server).toContain("status: 404");
  expect(server.indexOf("isUnsupportedMarketPath")).toBeLessThan(
    server.indexOf("await handleRequest(request)"),
  );
});

test("a localized redirect target is always absolute", () => {
  // `${params.locale}/account` omits the leading slash, so the browser resolves
  // it against the current directory: from /de-de/account/orders/123 the
  // shopper lands on /de-de/account/orders/de-de/account.
  for (const locale of SUPPORTED_LOCALES) {
    const target = localizedPathForRequest(
      new Request(`https://shop.test${locale.pathPrefix}/account/orders/123`),
      "/account",
    );

    expect(target.startsWith("/")).toBe(true);
    expect(target).toBe(`${locale.pathPrefix}/account`);
  }
});

test("customer-account navigation keeps the shopper's market", async () => {
  // Every one of these bypassed the locale helpers and dropped the market on a
  // non-default storefront: a raw react-router Link, a bare redirect literal,
  // and a sign-in URL the web component navigates to itself.
  const read = (path: string) =>
    readFile(new URL(`../../app/${path}`, import.meta.url), "utf8");

  const ordersList = await read("routes/account/orders/list.tsx");
  // The app's Link localizes its `to`; react-router's does not.
  expect(ordersList).not.toMatch(
    /import \{[^}]*\bLink\b[^}]*\} from "react-router"/,
  );
  expect(ordersList).toContain('from "~/components/link"');

  for (const route of [
    "routes/account/catch-all.ts",
    "routes/account/auth/logout.ts",
    "routes/account/edit.tsx",
    "routes/account/orders/order.tsx",
    "routes/account/address/index.tsx",
  ]) {
    const source = await read(route);
    expect({
      route,
      localized: source.includes("localizedPathForRequest"),
    }).toEqual({ route, localized: true });
    // A hand-built prefix is the exact shape that loses the leading slash.
    expect({
      route,
      handBuilt: /\$\{params\??\.locale\}/.test(source),
    }).toEqual({
      route,
      handBuilt: false,
    });
  }

  const header = await read("components/layout/header.tsx");
  expect(header).not.toContain('sign-in-url="/account/login"');
  expect(header).toContain("usePrefixPathWithLocale");
});

test("an unauthenticated account visit signs in on the same market", () => {
  // Hydrogen's default handler redirects to a fixed `/account/login`, so a
  // shopper bounced out of /de-de/account would sign in on the US storefront
  // and return there afterwards.
  for (const locale of SUPPORTED_LOCALES) {
    const response = unauthorizedRedirect(
      new Request(`https://shop.test${locale.pathPrefix}/account/orders/123`),
      locale,
    );
    const location = new URL(
      response.headers.get("Location") as string,
      "https://shop.test",
    );

    expect(response.status).toBe(302);
    expect(location.pathname).toBe(`${locale.pathPrefix}/account/login`);
    // The shopper must come back to the market's page, not the default one.
    expect(location.searchParams.get("return_to")).toBe(
      `${locale.pathPrefix}/account/orders/123`,
    );
  }
});

test("a single-fetch account request returns to a real page path", () => {
  // React Router requests `/de-de/account.data`; returning the shopper to that
  // URL after login would hand them a data payload instead of a page.
  const german = SUPPORTED_LOCALES.find(
    (locale) => locale.hreflang === "de-DE",
  ) as (typeof SUPPORTED_LOCALES)[number];
  const location = new URL(
    unauthorizedRedirect(
      new Request("https://shop.test/de-de/account.data"),
      german,
    ).headers.get("Location") as string,
    "https://shop.test",
  );

  expect(location.searchParams.get("return_to")).toBe("/de-de/account");
});

test("neutralizing a path preserves the single-fetch protocol", () => {
  // Hydrogen reads the `.data` suffix to choose between a 301 `Location` and a
  // 204 `X-Remix-Redirect`. Stripping it while neutralizing the market answers
  // a client-side navigation with a document redirect, which breaks the
  // in-flight fetch instead of routing it.
  expect(delocalizePath("/de-de/old-url.data")).toBe("/old-url.data");
  expect(delocalizePath("/ar-ae/collections/all.data")).toBe(
    "/collections/all.data",
  );
  // The default market has no prefix to strip, so the path is already neutral.
  expect(delocalizePath("/old-url.data")).toBe("/old-url.data");
  // Document requests keep their exact shape.
  expect(delocalizePath("/de-de/old-url")).toBe("/old-url");
  // `.data` on the market root still yields a rooted path.
  expect(delocalizePath("/de-de.data")).toBe("/.data");
});

test("every market URL from before the migration still resolves", async () => {
  // The prior contract is `app/utils/const.ts` at the pre-migration base. Those
  // prefixes are public URLs: indexed, linked, and bookmarked. Issue #473 asked
  // for one source of truth and new GCC/India markets — it never authorized
  // retiring a live market, and silently redirecting one to the US changes the
  // shopper's country and currency.
  const contract = JSON.parse(
    await readFile(
      new URL("./fixtures/prior-market-contract.json", import.meta.url),
      "utf8",
    ),
  ) as {
    markets: Array<{
      pathPrefix: string;
      language: string;
      country: string;
      currency: string;
    }>;
  };

  for (const market of contract.markets) {
    const locale = resolveLocale(`${market.pathPrefix}/products/hoodie`);

    expect({
      prefix: market.pathPrefix,
      language: locale.language,
      country: locale.country,
      currency: locale.currency,
    }).toEqual({
      prefix: market.pathPrefix,
      language: market.language,
      country: market.country,
      currency: market.currency,
    });
  }
});

test("the prior contract is a subset of the shipped markets", async () => {
  const contract = JSON.parse(
    await readFile(
      new URL("./fixtures/prior-market-contract.json", import.meta.url),
      "utf8",
    ),
  ) as { markets: Array<{ pathPrefix: string }> };
  const shipped = new Set(SUPPORTED_LOCALES.map((locale) => locale.pathPrefix));
  const dropped = contract.markets
    .map((market) => market.pathPrefix)
    .filter((prefix) => !shipped.has(prefix));

  // Removing a market is a product decision, not a refactor side effect.
  expect(dropped).toEqual([]);
});
