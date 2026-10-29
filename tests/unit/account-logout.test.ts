import { expect, test } from "@playwright/test";
import { customerAccountLogoutPath } from "../../app/utils/customer-account";
import { SUPPORTED_LOCALES } from "../../app/utils/locale";
import { createTestContext, serverFetch } from "../support/hydrogen-env";

/**
 * Hydrogen's logout handler lives at the fixed, unprefixed `/account/logout`
 * and defaults its post-logout redirect to the bare app origin, so a shopper
 * signing out of `/de-de/account` would land on the default market's home.
 * The market travels in `return_to`, which the handler hands to Shopify as
 * `post_logout_redirect_uri` (or redirects to directly when no ID token is
 * held). These post the sign-out form exactly as the dashboard renders it,
 * through the real worker.
 */
async function signOut(locale: (typeof SUPPORTED_LOCALES)[number]) {
  return serverFetch(
    new Request(`https://shop.test${customerAccountLogoutPath(locale)}`, {
      method: "POST",
      // A browser form post is same-origin; the handler refuses anything else.
      headers: {
        Origin: "https://shop.test",
        Referer: `https://shop.test${locale.pathPrefix}/account`,
      },
    }),
  );
}

test("signing out returns the shopper to their own market", async () => {
  for (const locale of SUPPORTED_LOCALES) {
    // The handler path is fixed: the market rides in the query string.
    expect(customerAccountLogoutPath(locale)).toMatch(/^\/account\/logout\?/);

    const response = await signOut(locale);

    // Shopify redirects here after clearing its session, so it must be an
    // absolute URL, and it must point at the market being signed out of.
    expect([302, 303]).toContain(response.status);
    const location = response.headers.get("Location");
    expect(location).toBeTruthy();
    expect(new URL(location as string).origin).toBe("https://shop.test");
    expect(new URL(location as string).pathname).toBe(locale.pathPrefix || "/");
  }
});

test("signing out never falls back to Hydrogen's bare origin", async () => {
  // The default is the origin itself, which silently lands every market on the
  // default storefront.
  const arabic = SUPPORTED_LOCALES.find(
    (locale) => locale.pathPrefix === "/ar-ae",
  );
  expect(arabic).toBeTruthy();
  const response = await signOut(arabic as (typeof SUPPORTED_LOCALES)[number]);

  expect(response.headers.get("Location")).toBe("https://shop.test/ar-ae");
});

test("a programmatic sign-out keeps the market of the page it ran on", async () => {
  // `context.customerAccount.logout()` runs from a loader when the session is
  // unusable; it must land on that page's market, not the bare origin.
  const context = await createTestContext("https://shop.test/ar-ae/account");
  const response = await context.customerAccount.logout();

  expect(
    new URL(response.headers.get("Location") as string, "https://shop.test")
      .pathname,
  ).toBe("/ar-ae");
});
