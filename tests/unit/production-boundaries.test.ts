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
