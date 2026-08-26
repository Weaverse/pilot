import { expect, test } from "@playwright/test";
import { redirect } from "react-router";
import { localizePath, resolveLocaleFromRequest } from "../../app/utils/locale";
import { safeRedirectPath } from "../../app/utils/safe-redirect";

/**
 * The `Location` a cart action would send for `redirectTo`, using the installed
 * React Router `redirect` the route itself calls.
 *
 * `redirectTo` is a hidden form field on a public, unauthenticated cart form,
 * so its value is attacker-controlled.
 */
function locationFor(redirectTo: unknown, fallback = "/cart"): string | null {
  const target = safeRedirectPath(redirectTo, fallback);

  return redirect(target).headers.get("Location");
}

test("a scheme-relative target is refused", () => {
  // `//evil.example/phish` is a network-path reference: the browser reads it as
  // `https://evil.example/phish`. `new URL()` throws on it without a base, so a
  // parse-failure check called it local and the trusted storefront issued the
  // redirect after a valid cart mutation.
  expect(locationFor("//evil.example/phish")).toBe("/cart");
});

test("every network-path spelling is refused", () => {
  // Browsers normalise backslashes to forward slashes in the authority, so
  // these are the same attack wearing different clothes.
  for (const hostile of [
    "//evil.example/phish",
    "///evil.example/phish",
    "//\\evil.example/phish",
    "\\\\evil.example/phish",
    "\\/evil.example/phish",
    "/\\evil.example/phish",
    "//evil.example",
    "//evil.example:443/phish",
    "//user:pass@evil.example/phish",
  ]) {
    expect({ hostile, location: locationFor(hostile) }).toEqual({
      hostile,
      location: "/cart",
    });
  }
});

test("an absolute URL is refused whatever its scheme", () => {
  for (const hostile of [
    "https://evil.example/phish",
    "http://evil.example/phish",
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "HTTPS://evil.example/phish",
    " https://evil.example/phish",
  ]) {
    expect({ hostile, location: locationFor(hostile) }).toEqual({
      hostile,
      location: "/cart",
    });
  }
});

test("a malformed or missing target falls back", () => {
  for (const bad of ["", "not-a-path", "cart", null, undefined, 42, {}]) {
    expect({ bad, location: locationFor(bad) }).toEqual({
      bad,
      location: "/cart",
    });
  }
});

test("a localized local path is preserved", () => {
  // The legitimate use: the country selector posts a buyer-identity update and
  // sends the shopper to the same page in their new market.
  for (const good of [
    "/cart",
    "/de-de/cart",
    "/ar-ae/collections/all",
    "/hi-in/products/hoodie",
  ]) {
    expect({ good, location: locationFor(good) }).toEqual({
      good,
      location: good,
    });
  }
});

test("query and hash semantics survive", () => {
  // Switching markets must keep an active filter, sort, or anchor.
  for (const good of [
    "/de-de/collections/all?sort=price",
    "/collections/all?filter.v.price.gte=10&sort=price",
    "/products/hoodie#reviews",
    "/de-de/products/hoodie?variant=42#reviews",
  ]) {
    expect({ good, location: locationFor(good) }).toEqual({
      good,
      location: good,
    });
  }
});

test("the fallback is the caller's localized cart", () => {
  // A refused target must not dump a German shopper on the US cart.
  expect(locationFor("//evil.example/phish", "/de-de/cart")).toBe(
    "/de-de/cart",
  );
});

test("a redirect keeps the cart-id cookie", async () => {
  // The mutation may have created the cart being redirected away from. Before
  // the guard, a refused target fell through to `data(..., { headers })`, so
  // the cookie was set; a redirect that drops the headers loses the cart on
  // exactly the request that created it.
  const headers = { "Set-Cookie": "cart=gid://shopify/Cart/abc123; Path=/" };
  const response = redirect(safeRedirectPath("//evil.example", "/cart"), {
    headers,
  });

  expect(response.headers.get("Location")).toBe("/cart");
  expect(response.headers.get("Set-Cookie")).toBe(
    "cart=gid://shopify/Cart/abc123; Path=/",
  );
});

test("the cart action's redirect decision is the guarded one", async () => {
  // The whole action needs a Shopify cart client, so exercise the decision it
  // makes: read `redirectTo` from real `FormData`, resolve the shopper's market
  // from the real request, and guard the target. Bypassing `safeRedirectPath`
  // here is the regression, and a `String(redirectTo)` shortcut reproduces the
  // original open redirect exactly.
  const form = new FormData();
  form.set("redirectTo", "//evil.example/phish");

  const request = new Request("https://shop.test/de-de/cart", {
    method: "POST",
    body: form,
  });
  const submitted = await request.formData();
  const locale = resolveLocaleFromRequest(request);
  const location = redirect(
    safeRedirectPath(
      submitted.get("redirectTo"),
      localizePath("/cart", locale),
    ),
  ).headers.get("Location");

  // Refused, and the German shopper stays on the German cart.
  expect(location).toBe("/de-de/cart");
});

test("a legitimate market switch still redirects", async () => {
  const form = new FormData();
  form.set("redirectTo", "/ar-ae/collections/all?sort=price");

  const request = new Request("https://shop.test/de-de/cart", {
    method: "POST",
    body: form,
  });
  const submitted = await request.formData();
  const locale = resolveLocaleFromRequest(request);

  expect(
    redirect(
      safeRedirectPath(
        submitted.get("redirectTo"),
        localizePath("/cart", locale),
      ),
    ).headers.get("Location"),
  ).toBe("/ar-ae/collections/all?sort=price");
});
