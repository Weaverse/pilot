import { expect, test } from "@playwright/test";
import { CartForm } from "@shopify/hydrogen";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { loadCriticalData } from "../../app/.server/root";
import { DEFAULT_LOCALE } from "../../app/utils/locale";
import { loadAppModule } from "../support/render-app";

/** The shipped cart route, bundled the way the app bundles it. */
async function cartRoute() {
  return loadAppModule<{
    action: (args: ActionFunctionArgs) => Promise<Response | unknown>;
  }>("routes/cart/cart-page.tsx");
}

/**
 * Tests that execute the boundaries a release depends on.
 *
 * A helper test proves a rule is correct; it cannot prove the shipping code
 * still calls it. Every fix in this branch is one call away from silently
 * reverting — a route reading `redirectTo` straight from the form, a loader
 * returning the raw theme payload — and each of those reverts is a released
 * defect, not a refactor. So these drive the real route action and the real
 * root loader.
 */

/** Theme payload as the Weaverse API returns it: bundle absent, overrides raw. */
const WEAVERSE_THEME = {
  theme: { topbarText: "<p>MERCHANT LEGACY</p>" },
  staticContent: { footer: { copyright: "EN COPYRIGHT" } },
  merchantOverrides: { footer: { copyright: "PUBLISHED COPYRIGHT" } },
};

const LAYOUT = {
  shop: {
    id: "gid://shopify/Shop/1",
    name: "Test shop",
    description: "",
    primaryDomain: { url: "https://shop.test" },
    brand: null,
  },
  headerMenu: null,
  footerMenu: null,
};

/** A context exposing exactly what the root loader reads. */
function rootContext(language: string, country: string) {
  return {
    storefront: {
      i18n: { language, country, hreflang: `${language}-${country}` },
      // `getShopAnalytics` fires a query whose promise the loader returns
      // unawaited. Answering it with the real shape keeps the rejection from
      // surfacing inside whichever test happens to run next.
      query: async () => ({
        shop: LAYOUT.shop,
        layout: LAYOUT,
        localization: {
          language: { isoCode: language },
          country: { currency: { isoCode: "EUR" } },
        },
      }),
      CacheLong: () => undefined,
    },
    weaverse: { loadThemeSettings: async () => WEAVERSE_THEME },
    env: {
      PUBLIC_STOREFRONT_ID: "id",
      PUBLIC_CHECKOUT_DOMAIN: "checkout.test",
      PUBLIC_STOREFRONT_API_TOKEN: "token",
      PUBLIC_GOOGLE_GTM_ID: "",
      PUBLIC_STORE_DOMAIN: "shop.test",
    },
  };
}

test("the root loader localizes the theme payload it sends to the client", async () => {
  // `localizedThemePayload` merges the market bundle into `staticContent` and
  // leaves `merchantOverrides` untouched, which is what tells the legacy
  // fallback whether a saved setting is still the merchant's intent. Returning
  // the API payload verbatim republishes demo copy over saved copy.
  const context = rootContext("DE", "DE");
  const loaded = await loadCriticalData({
    request: new Request("https://shop.test/de-de/"),
    context,
    params: {},
  } as unknown as LoaderFunctionArgs);

  const theme = loaded.weaverseTheme as {
    staticContent: Record<string, Record<string, string>>;
    merchantOverrides: Record<string, Record<string, string>>;
  };

  expect({
    // German bundle merged in, replacing the English source.
    localized: theme.staticContent.footer.copyright,
    // Published overrides passed through, still distinguishable as published.
    published: theme.merchantOverrides.footer.copyright,
    // The bundle must not be relabelled as something the merchant published.
    bundleNotPublished:
      theme.merchantOverrides.announcement === undefined &&
      theme.staticContent.footer.copyright !== "EN COPYRIGHT",
  }).toEqual({
    localized: "© 2024 Weaverse. Alle Rechte vorbehalten.",
    published: "PUBLISHED COPYRIGHT",
    bundleNotPublished: true,
  });
});

/** The `Location` the cart action answers with for `redirectTo`. */
async function cartRedirectFor(
  pathPrefix: string,
  redirectTo: string,
): Promise<string | null> {
  const body = new URLSearchParams({
    cartFormInput: JSON.stringify({
      action: CartForm.ACTIONS.BuyerIdentityUpdate,
      inputs: { buyerIdentity: { countryCode: "DE" } },
    }),
    redirectTo,
  });

  const { action: cartAction } = await cartRoute();
  const response = await cartAction({
    request: new Request(`https://shop.test${pathPrefix}/cart`, {
      method: "POST",
      body,
      headers: { "content-type": "application/x-www-form-urlencoded" },
    }),
    context: {
      cart: {
        getCartId: () => "gid://shopify/Cart/1",
        updateBuyerIdentity: async () => ({
          cart: { id: "gid://shopify/Cart/1" },
        }),
        setCartId: () => new Headers({ "set-cookie": "cart=1" }),
      },
      storefront: { i18n: DEFAULT_LOCALE },
    },
    params: {},
  } as unknown as ActionFunctionArgs);

  return response instanceof Response ? response.headers.get("Location") : null;
}

test("the cart action refuses an off-origin redirect target", async () => {
  // `redirectTo` is a hidden field on an unauthenticated public form. A guard
  // that lives in a helper but is not called by this action is a live open
  // redirect, which is why this exercises the route rather than the helper.
  expect({
    networkPath: await cartRedirectFor("/de-de", "//evil.example/phish"),
    tripleSlash: await cartRedirectFor("/de-de", "///evil.example/phish"),
    backslash: await cartRedirectFor("/de-de", "/\\evil.example/phish"),
    absolute: await cartRedirectFor("/de-de", "https://evil.example/phish"),
  }).toEqual({
    networkPath: "/de-de/cart",
    tripleSlash: "/de-de/cart",
    backslash: "/de-de/cart",
    absolute: "/de-de/cart",
  });
});

test("the cart action keeps a legitimate localized target", async () => {
  expect({
    localized: await cartRedirectFor(
      "/de-de",
      "/ar-ae/collections/all?sort=price",
    ),
    fragment: await cartRedirectFor("/de-de", "/products/hoodie#reviews"),
  }).toEqual({
    localized: "/ar-ae/collections/all?sort=price",
    fragment: "/products/hoodie#reviews",
  });
});

test("a refused redirect still carries the cart cookie", async () => {
  // The refused branch used to fall through to `data(..., { headers })`. A
  // redirect that drops them loses a cart created by this very request.
  const body = new URLSearchParams({
    cartFormInput: JSON.stringify({
      action: CartForm.ACTIONS.BuyerIdentityUpdate,
      inputs: { buyerIdentity: { countryCode: "DE" } },
    }),
    redirectTo: "//evil.example/phish",
  });

  const { action: cartAction } = await cartRoute();
  const response = await cartAction({
    request: new Request("https://shop.test/de-de/cart", {
      method: "POST",
      body,
      headers: { "content-type": "application/x-www-form-urlencoded" },
    }),
    context: {
      cart: {
        getCartId: () => "gid://shopify/Cart/1",
        updateBuyerIdentity: async () => ({
          cart: { id: "gid://shopify/Cart/1" },
        }),
        setCartId: () => new Headers({ "set-cookie": "cart=1" }),
      },
      storefront: { i18n: DEFAULT_LOCALE },
    },
    params: {},
  } as unknown as ActionFunctionArgs);

  expect(
    response instanceof Response ? response.headers.get("set-cookie") : null,
  ).toBe("cart=1");
});

/**
 * Where a browser lands after the discount route answers.
 *
 * Asserting the `Location` string alone is not enough: `/\evil.example` and
 * `/de-de/products` are both "relative-looking", and only resolution against
 * the request URL tells them apart. So this reports the resolved origin next
 * to the header, and the assertions read both.
 */
async function discountRedirectFor(
  requestUrl: string,
): Promise<{ location: string | null; origin: string | null }> {
  const { loader } = await loadAppModule<{
    loader: (args: LoaderFunctionArgs) => Promise<Response>;
  }>("routes/others/discount-code.tsx");

  const url = new URL(requestUrl);
  const response = await loader({
    request: new Request(requestUrl),
    context: {
      cart: {
        updateDiscountCodes: async () => ({
          cart: { id: "gid://shopify/Cart/1" },
        }),
        setCartId: () => new Headers({ "set-cookie": "cart=1" }),
      },
    },
    params: { code: "SALE", locale: url.pathname.split("/")[1] || undefined },
  } as unknown as LoaderFunctionArgs);

  const location = response.headers.get("Location");
  return {
    location,
    origin: location ? new URL(location, requestUrl).origin : null,
  };
}

test("the discount route refuses an off-origin redirect target", async () => {
  // `?redirect=` is public and unauthenticated. `URLSearchParams` decodes
  // `%2F%5C` to `/\`, which a `includes("//")` check reads as a local path
  // while every browser reads the backslash as an authority separator.
  const attacks = {
    encodedBackslash: "/discount/SALE?redirect=%2F%5Cevil.example%2Fphish",
    rawBackslash: "/discount/SALE?redirect=/\\evil.example/phish",
    doubleBackslash: "/discount/SALE?redirect=%5C%5Cevil.example",
    networkPath: "/discount/SALE?redirect=//evil.example/phish",
    tripleSlash: "/discount/SALE?redirect=///evil.example/phish",
    absolute: "/discount/SALE?redirect=https://evil.example/phish",
    scheme: "/discount/SALE?redirect=javascript:alert(1)",
    tabSplit: "/discount/SALE?redirect=/%09/evil.example",
    returnTo: "/discount/SALE?return_to=%2F%5Cevil.example",
    traversal: "/discount/SALE?redirect=/..//evil.example",
  };

  const origins: Record<string, string | null> = {};
  for (const [name, path] of Object.entries(attacks)) {
    origins[name] = (
      await discountRedirectFor(`https://shop.test${path}`)
    ).origin;
  }

  expect(origins).toEqual({
    encodedBackslash: "https://shop.test",
    rawBackslash: "https://shop.test",
    doubleBackslash: "https://shop.test",
    networkPath: "https://shop.test",
    tripleSlash: "https://shop.test",
    absolute: "https://shop.test",
    scheme: "https://shop.test",
    tabSplit: "https://shop.test",
    returnTo: "https://shop.test",
    traversal: "https://shop.test",
  });
});

test("a refused discount redirect stays on the shopper's market", async () => {
  // Falling back to `/` would drop a `/de-de` shopper onto the default market,
  // so the refusal has to be localized, not just safe.
  expect(
    (
      await discountRedirectFor(
        "https://shop.test/de-de/discount/SALE?redirect=%2F%5Cevil.example",
      )
    ).location,
  ).toBe("/de-de");
});

test("the discount route keeps a legitimate target, query and hash", async () => {
  const [localized, extraParams, fragment, defaultMarket, ownQuery, both] =
    await Promise.all([
      discountRedirectFor(
        "https://shop.test/de-de/discount/SALE?redirect=/de-de/collections/all",
      ),
      discountRedirectFor(
        "https://shop.test/discount/SALE?redirect=/collections/all&sort=price",
      ),
      discountRedirectFor(
        "https://shop.test/discount/SALE?redirect=/products/hoodie%23reviews",
      ),
      discountRedirectFor("https://shop.test/discount/SALE"),
      discountRedirectFor(
        "https://shop.test/discount/SALE?redirect=/collections/all%3Fsort%3Dprice&page=2",
      ),
      discountRedirectFor(
        "https://shop.test/discount/SALE?redirect=/products/hoodie%23reviews&utm=ad",
      ),
    ]);

  expect({
    localized: localized.location,
    extraParams: extraParams.location,
    fragment: fragment.location,
    defaultMarket: defaultMarket.location,
    ownQuery: ownQuery.location,
    both: both.location,
  }).toEqual({
    localized: "/de-de/collections/all",
    // Parameters that are not the redirect target ride along to the target.
    extraParams: "/collections/all?sort=price",
    fragment: "/products/hoodie#reviews",
    defaultMarket: "/",
    // A target carrying its own query keeps it; the extras join with `&`.
    ownQuery: "/collections/all?sort=price&page=2",
    // Extras go before the fragment, or the browser reads them as part of it.
    both: "/products/hoodie?utm=ad#reviews",
  });
});

test("the discount route still applies the code and sets the cart cookie", async () => {
  const { loader } = await loadAppModule<{
    loader: (args: LoaderFunctionArgs) => Promise<Response>;
  }>("routes/others/discount-code.tsx");

  const applied: string[][] = [];
  const response = await loader({
    request: new Request(
      "https://shop.test/de-de/discount/SALE?redirect=%2F%5Cevil.example",
    ),
    context: {
      cart: {
        updateDiscountCodes: async (codes: string[]) => {
          applied.push(codes);
          return { cart: { id: "gid://shopify/Cart/1" } };
        },
        setCartId: () => new Headers({ "set-cookie": "cart=1" }),
      },
    },
    params: { code: "SALE", locale: "de-de" },
  } as unknown as LoaderFunctionArgs);

  // A refused target must not cost the shopper the discount or the cart.
  expect({
    applied,
    status: response.status,
    cookie: response.headers.get("set-cookie"),
  }).toEqual({
    applied: [["SALE"]],
    status: 303,
    cookie: "cart=1",
  });
});

test("the legacy article redirect refuses an off-origin locale segment", async () => {
  // `:locale?` is a URL segment, so `%5C` arrives decoded as `\` and was
  // interpolated straight into the `Location`.
  const { loader } = await loadAppModule<{
    loader: (args: LoaderFunctionArgs) => Promise<Response>;
  }>("routes/blogs/article-redirect.tsx");

  // Driven by request URL, not by a hand-set param: the router decodes the
  // segment, so this is the shape the loader really receives.
  const redirectFor = async (localeSegment: string) => {
    const requestUrl = `https://shop.test${localeSegment}/articles/some-article`;
    const response = await loader({
      params: {
        locale: localeSegment ? localeSegment.slice(1) : undefined,
        articleHandle: "some-article",
      },
      context: {
        storefront: {
          query: async () => ({
            blogs: {
              nodes: [{ handle: "news", articleByHandle: { handle: "a" } }],
              pageInfo: { hasNextPage: false, endCursor: null },
            },
          }),
        },
      },
      request: new Request(requestUrl),
    } as unknown as LoaderFunctionArgs);

    const location = response.headers.get("Location");
    return {
      location,
      origin: location ? new URL(location, requestUrl).origin : null,
    };
  };

  const [attack, networkPath, valid, none] = await Promise.all([
    redirectFor("/\\evil.example"),
    redirectFor("//evil.example"),
    redirectFor("/de-de"),
    redirectFor(""),
  ]);

  expect({
    attack: attack.origin,
    networkPath: networkPath.origin,
    valid: valid.location,
    none: none.location,
  }).toEqual({
    attack: "https://shop.test",
    networkPath: "https://shop.test",
    // A real market still reaches its localized article.
    valid: "/de-de/blogs/news/some-article",
    none: "/blogs/news/some-article",
  });
});
