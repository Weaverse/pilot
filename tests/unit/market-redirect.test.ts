import { expect, test } from "@playwright/test";
import { marketAwareRedirect } from "../../app/.server/market-redirect";

const NOT_FOUND = () => new Response("Not Found", { status: 404 });

/**
 * Stands in for `storefrontRedirect`, recording the path Shopify was asked
 * about and replying the way Hydrogen does.
 *
 * Hydrogen answers a document navigation with 301 + `Location`, and a React
 * Router single-fetch navigation with 204 + `X-Remix-Redirect`.
 */
function shopifyRedirects(
  table: Record<string, string>,
  carrier: "Location" | "X-Remix-Redirect",
) {
  const asked: string[] = [];

  return {
    asked,
    lookup: async (request: Request) => {
      const url = new URL(request.url);
      asked.push(url.pathname);
      const target = table[url.pathname];
      if (!target) {
        return NOT_FOUND();
      }

      return carrier === "Location"
        ? new Response(null, {
            status: 301,
            headers: { Location: new URL(target, url).toString() },
          })
        : new Response(null, {
            status: 204,
            headers: { "X-Remix-Redirect": target },
          });
    },
  };
}

test("a document redirect keeps the shopper on their market", async () => {
  const { asked, lookup } = shopifyRedirects(
    { "/collections/all": "/collections/the-full-catalog" },
    "Location",
  );

  const response = await marketAwareRedirect(
    new Request("https://shop.test/de-de/collections/all"),
    NOT_FOUND(),
    lookup,
  );

  // Shopify stores redirects market-neutral, so that is what it must be asked.
  expect(asked).toEqual(["/collections/all"]);
  expect(response.status).toBe(301);
  expect(response.headers.get("Location")).toBe(
    "https://shop.test/de-de/collections/the-full-catalog",
  );
});

test("a single-fetch redirect stays a single-fetch redirect", async () => {
  // Answering a `.data` navigation with a document redirect breaks the in-flight
  // fetch instead of routing it.
  const { asked, lookup } = shopifyRedirects(
    { "/collections/all.data": "/collections/the-full-catalog" },
    "X-Remix-Redirect",
  );

  const response = await marketAwareRedirect(
    new Request("https://shop.test/ar-ae/collections/all.data"),
    NOT_FOUND(),
    lookup,
  );

  // The `.data` suffix is request protocol, not market, so it survives.
  expect(asked).toEqual(["/collections/all.data"]);
  expect(response.status).toBe(204);
  expect(response.headers.get("Location")).toBe(null);
  // `X-Remix-Redirect` is app-relative, matching what Hydrogen emits.
  expect(response.headers.get("X-Remix-Redirect")).toBe(
    "/ar-ae/collections/the-full-catalog",
  );
});

test("the query string survives the round trip", async () => {
  const { lookup } = shopifyRedirects(
    { "/old": "/new?utm_source=email" },
    "Location",
  );

  const response = await marketAwareRedirect(
    new Request("https://shop.test/hi-in/old?ref=nav"),
    NOT_FOUND(),
    lookup,
  );

  expect(response.headers.get("Location")).toBe(
    "https://shop.test/hi-in/new?utm_source=email",
  );
});

test("the default market is looked up without a detour", async () => {
  const { asked, lookup } = shopifyRedirects({ "/old": "/new" }, "Location");

  const response = await marketAwareRedirect(
    new Request("https://shop.test/old"),
    NOT_FOUND(),
    lookup,
  );

  expect(asked).toEqual(["/old"]);
  // Nothing to relocalize, so Hydrogen's own response passes straight through.
  expect(response.headers.get("Location")).toBe("https://shop.test/new");
});

test("an off-origin target is never rewritten", async () => {
  // Checkout and admin targets belong to Shopify; prefixing them with our
  // market would corrupt someone else's URL.
  const { lookup } = shopifyRedirects(
    { "/checkout-now": "https://checkout.shop.test/c/abc123" },
    "Location",
  );

  const response = await marketAwareRedirect(
    new Request("https://shop.test/de-de/checkout-now"),
    NOT_FOUND(),
    lookup,
  );

  expect(response.headers.get("Location")).toBe(
    "https://checkout.shop.test/c/abc123",
  );
});

test("a genuine miss stays a 404", async () => {
  const { asked, lookup } = shopifyRedirects({}, "Location");
  const notFound = new Response("Not Found", { status: 404 });

  const response = await marketAwareRedirect(
    new Request("https://shop.test/de-de/definitely-not-a-page"),
    notFound,
    lookup,
  );

  expect(asked).toEqual(["/definitely-not-a-page"]);
  expect(response.status).toBe(404);
  // The app's own 404 is returned, not a fabricated redirect.
  expect(response).toBe(notFound);
});

test("exactly one redirect header is emitted", async () => {
  // Spreading headers into an object literal and then setting `Location`
  // appends a second value, producing a comma-joined, unusable URL.
  const { lookup } = shopifyRedirects({ "/old": "/new" }, "Location");

  const response = await marketAwareRedirect(
    new Request("https://shop.test/fr-fr/old"),
    NOT_FOUND(),
    lookup,
  );
  const location = response.headers.get("Location") as string;

  expect(location.split(",")).toHaveLength(1);
  expect(location).toBe("https://shop.test/fr-fr/new");
});
