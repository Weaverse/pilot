import { expect, test } from "@playwright/test";
import type { AppLoadContext } from "react-router";
import { doLogout } from "../../app/routes/account/auth/logout";
import { SUPPORTED_LOCALES } from "../../app/utils/locale";

/**
 * Records the options `doLogout` hands to Hydrogen.
 *
 * `customerAccount.logout()` defaults `postLogoutRedirectUri` to the bare app
 * origin, so asserting the argument is the only way to prove the market
 * survives sign-out without standing up Shopify's OAuth flow.
 */
function contextSpy() {
  const calls: Array<{ postLogoutRedirectUri?: string } | undefined> = [];

  return {
    calls,
    context: {
      customerAccount: {
        logout: (options?: { postLogoutRedirectUri?: string }) => {
          calls.push(options);
          return new Response(null, { status: 302 });
        },
      },
    } as unknown as AppLoadContext,
  };
}

test("signing out returns the shopper to their own market", async () => {
  for (const locale of SUPPORTED_LOCALES) {
    const { calls, context } = contextSpy();
    await doLogout(
      context,
      new Request(`https://shop.test${locale.pathPrefix}/account/logout`, {
        method: "POST",
      }),
    );

    // Shopify redirects here after clearing its session, so it must be an
    // absolute URL, and it must point at the market being signed out of.
    expect(calls).toHaveLength(1);
    const uri = calls[0]?.postLogoutRedirectUri;
    expect(uri).toBeTruthy();
    expect(new URL(uri as string).pathname).toBe(locale.pathPrefix || "/");
  }
});

test("signing out never falls back to Hydrogen's bare origin", async () => {
  // The default is the origin itself, which silently lands every market on the
  // default storefront.
  const { calls, context } = contextSpy();
  await doLogout(
    context,
    new Request("https://shop.test/ar-ae/account", { method: "POST" }),
  );

  expect(calls[0]?.postLogoutRedirectUri).toBe("https://shop.test/ar-ae");
});
