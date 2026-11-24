import { expect, test } from "@playwright/test";
import {
  CUSTOMER_ACCOUNT_LOGOUT_PATH,
  CUSTOMER_ACCOUNT_SIGNED_OUT_PATH,
} from "../../app/utils/customer-account";
import { SUPPORTED_LOCALES } from "../../app/utils/locale";
import { createTestContext, serverFetch } from "../support/hydrogen-env";

/**
 * Shopify only returns a sign-out to a registered logout URI, so every
 * sign-out lands on the one fixed `/account/signed-out`. The logout handler
 * remembers the market of the page that posted the form (its `Referer`) in
 * the session, and `/account/signed-out` redirects to that market's home.
 * Without an ID token the handler redirects to `/account/signed-out` directly,
 * which is the redirect Shopify makes after clearing its own session. These
 * run the sign-out form and that landing through the real worker.
 */
async function signOut(locale: (typeof SUPPORTED_LOCALES)[number]) {
  return serverFetch(
    new Request(`https://shop.test${CUSTOMER_ACCOUNT_LOGOUT_PATH}`, {
      method: "POST",
      // A browser form post is same-origin; the handler refuses anything else.
      headers: {
        Origin: "https://shop.test",
        Referer: `https://shop.test${locale.pathPrefix}/account`,
      },
    }),
  );
}

/** Follows a sign-out to `/account/signed-out` with the session it set. */
async function landAfterSignOut(signOutResponse: Response) {
  const cookie = signOutResponse.headers
    .getSetCookie()
    .map((value) => value.split(";", 1)[0])
    .join("; ");
  return serverFetch(
    new Request(`https://shop.test${CUSTOMER_ACCOUNT_SIGNED_OUT_PATH}`, {
      headers: { Cookie: cookie },
    }),
  );
}

test("signing out returns the shopper to their own market", async () => {
  for (const locale of SUPPORTED_LOCALES) {
    const response = await signOut(locale);

    expect([302, 303]).toContain(response.status);
    expect(response.headers.get("Location")).toBe(
      `https://shop.test${CUSTOMER_ACCOUNT_SIGNED_OUT_PATH}`,
    );

    const landing = await landAfterSignOut(response);
    expect([302, 303]).toContain(landing.status);
    expect(
      new URL(landing.headers.get("Location") as string, "https://shop.test")
        .pathname,
    ).toBe(locale.pathPrefix || "/");
  }
});

test("the signed-out landing defaults to the default market's home", async () => {
  const response = await serverFetch(
    new Request(`https://shop.test${CUSTOMER_ACCOUNT_SIGNED_OUT_PATH}`),
  );

  expect([302, 303]).toContain(response.status);
  expect(
    new URL(response.headers.get("Location") as string, "https://shop.test")
      .pathname,
  ).toBe("/");
});

test("a programmatic sign-out keeps the market of the page it ran on", async () => {
  // `context.customerAccount.logout()` runs from a loader when the session is
  // unusable; it must land on that page's market, not the bare origin.
  const context = await createTestContext("https://shop.test/ar-ae/account");
  const response = await context.customerAccount.logout();

  expect(
    new URL(response.headers.get("Location") as string, "https://shop.test")
      .pathname,
  ).toBe(CUSTOMER_ACCOUNT_SIGNED_OUT_PATH);
  expect(context.session.getSessionItem("signedOutMarket")).toBe("/ar-ae");
});
