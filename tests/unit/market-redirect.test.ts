import { expect, test } from "@playwright/test";
import { marketAwareRedirect } from "../../app/.server/market-redirect";

/**
 * Stands in for `handleShopifyRedirects`, recording the path Shopify was asked
 * about and replying the way Hydrogen does: a 301 with an absolute `Location`
 * for a matching document path, and `null` when nothing matches. Hydrogen
 * 2026.10 only ever matches document paths; the single-fetch protocol is
 * `marketAwareRedirect`'s job.
 */
function shopifyRedirects(table: Record<string, string>, status = 301) {
  const asked: string[] = [];

  return {
    asked,
    lookup: async (request: Request) => {
      const url = new URL(request.url);
      asked.push(url.pathname);
      const target = table[url.pathname];
      if (!target) {
        return null;
      }

      return new Response(null, {
        status,
        headers: { Location: new URL(target, url).toString() },
      });
    },
  };
}

/** `marketAwareRedirect`, asserting it produced a redirect. */
async function redirectFor(
  url: string,
  lookup: (request: Request) => Promise<Response | null>,
): Promise<Response> {
  const response = await marketAwareRedirect(new Request(url), lookup);
  if (!response) {
    throw new Error(`expected a redirect for ${url}`);
  }
  return response;
}

test("a document redirect keeps the shopper on their market", async () => {
  const { asked, lookup } = shopifyRedirects({
    "/collections/all": "/collections/the-full-catalog",
  });

  const response = await redirectFor(
    "https://shop.test/de-de/collections/all",
    lookup,
  );

  // Shopify stores redirects market-neutral, so that is what it must be asked.
  expect(asked).toEqual(["/collections/all"]);
  expect(response.status).toBe(301);
  expect(response.headers.get("Location")).toBe(
    "https://shop.test/de-de/collections/the-full-catalog",
  );
});

test("a single-fetch navigation is looked up by its document path", async () => {
  // A `<Link>` to a redirected URL fetches `/old-path.data`, which Hydrogen
  // never matches: the lookup must use the page path behind it.
  const { asked, lookup } = shopifyRedirects({
    "/collections/all": "/collections/the-full-catalog",
  });

  await redirectFor("https://shop.test/ar-ae/collections/all.data", lookup);

  expect(asked).toEqual(["/collections/all"]);
});

test("a single-fetch redirect stays a single-fetch redirect", async () => {
  // Answering a `.data` navigation with a document redirect breaks the in-flight
  // fetch instead of routing it, so it is answered as classic Hydrogen's
  // `storefrontRedirect` did: 204 with `X-Remix-Redirect`.
  const { lookup } = shopifyRedirects({
    "/collections/all": "/collections/the-full-catalog",
  });

  const response = await redirectFor(
    "https://shop.test/ar-ae/collections/all.data",
    lookup,
  );

  expect(response.status).toBe(204);
  expect(response.headers.get("Location")).toBe(null);
  // `X-Remix-Redirect` is app-relative and keeps the market.
  expect(response.headers.get("X-Remix-Redirect")).toBe(
    "/ar-ae/collections/the-full-catalog",
  );
  // React Router reads the redirect's own status from here.
  expect(response.headers.get("X-Remix-Status")).toBe("301");
});

test("a soft navigation keeps Shopify's redirect status", async () => {
  const { lookup } = shopifyRedirects({ "/old": "/new" }, 302);

  const response = await redirectFor(
    "https://shop.test/de-de/old.data",
    lookup,
  );

  expect({
    status: response.status,
    remixStatus: response.headers.get("X-Remix-Status"),
    target: response.headers.get("X-Remix-Redirect"),
  }).toEqual({ status: 204, remixStatus: "302", target: "/de-de/new" });
});

test("single-fetch root and trailing-slash requests map to their pages", async () => {
  // React Router fetches `/_root.data` for `/` and `/path/_.data` for
  // `/path/`; neither is a page path Shopify could have a redirect for.
  const { asked, lookup } = shopifyRedirects({});

  expect(
    await marketAwareRedirect(
      new Request("https://shop.test/_root.data"),
      lookup,
    ),
  ).toBe(null);
  expect(
    await marketAwareRedirect(
      new Request("https://shop.test/de-de/old/_.data"),
      lookup,
    ),
  ).toBe(null);

  expect(asked).toEqual(["/", "/old/"]);
});

test("the query string survives the round trip", async () => {
  const { lookup } = shopifyRedirects({ "/old": "/new?utm_source=email" });

  const response = await redirectFor(
    "https://shop.test/hi-in/old?ref=nav",
    lookup,
  );

  expect(response.headers.get("Location")).toBe(
    "https://shop.test/hi-in/new?utm_source=email",
  );
});

test("the default market is looked up without a detour", async () => {
  const { asked, lookup } = shopifyRedirects({ "/old": "/new" });

  const response = await redirectFor("https://shop.test/old", lookup);

  expect(asked).toEqual(["/old"]);
  // Nothing to relocalize, so the target is Shopify's own.
  expect(response.headers.get("Location")).toBe("https://shop.test/new");
});

test("an off-origin target is never rewritten", async () => {
  // Checkout and admin targets belong to Shopify; prefixing them with our
  // market would corrupt someone else's URL.
  const { lookup } = shopifyRedirects({
    "/checkout-now": "https://checkout.shop.test/c/abc123",
  });

  const document = await redirectFor(
    "https://shop.test/de-de/checkout-now",
    lookup,
  );
  const soft = await redirectFor(
    "https://shop.test/de-de/checkout-now.data",
    lookup,
  );

  expect({
    document: document.headers.get("Location"),
    soft: soft.headers.get("X-Remix-Redirect"),
  }).toEqual({
    document: "https://checkout.shop.test/c/abc123",
    soft: "https://checkout.shop.test/c/abc123",
  });
});

test("a genuine miss leaves the app's 404 standing", async () => {
  const { asked, lookup } = shopifyRedirects({});

  const response = await marketAwareRedirect(
    new Request("https://shop.test/de-de/definitely-not-a-page"),
    lookup,
  );

  expect(asked).toEqual(["/definitely-not-a-page"]);
  // No fabricated redirect: the caller keeps the app's own 404.
  expect(response).toBe(null);
});

test("exactly one redirect header is emitted", async () => {
  // Spreading headers into an object literal and then setting `Location`
  // appends a second value, producing a comma-joined, unusable URL.
  const { lookup } = shopifyRedirects({ "/old": "/new" });

  const response = await redirectFor("https://shop.test/fr-fr/old", lookup);
  const location = response.headers.get("Location") as string;

  expect(location.split(",")).toHaveLength(1);
  expect(location).toBe("https://shop.test/fr-fr/new");
});
