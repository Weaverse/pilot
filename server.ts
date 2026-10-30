import { handleShopifyRedirects, handleShopifyRoutes } from "@shopify/hydrogen";
import { createRequestHandler, RouterContextProvider } from "react-router";
import * as serverBuild from "virtual:react-router/server-build";
import { cartHandlers, createPilotCartHandlers } from "~/.server/cart";
import { createAppContext } from "~/.server/context";
import { getCustomerAccountHandlers } from "~/.server/customer-account";
import { marketAwareRedirect } from "~/.server/market-redirect";
import { predictiveSearchHandlers } from "~/.server/predictive-search";
import { isUnsupportedMarketPath } from "~/utils/locale";
import { routeTemplates } from "~/utils/route-templates";

/** An unprefixed cart permalink: `/cart/41007289663544:1,41007289696312:2`. */
const CART_PERMALINK_PATH = /^\/cart\/[^/]+:\d+/;

const handleRequest = createRequestHandler(serverBuild, process.env.NODE_ENV);

/**
 * Export a fetch handler in module format.
 *
 * Hydrogen 2026.10 is a library: this handler composes the request lifecycle
 * that the classic framework owned.
 *
 * 1. Build the request context and clients.
 * 2. Let Hydrogen answer the routes it owns (cart, Storefront API proxy,
 *    checkout and cart permalinks, Customer Account OAuth, ...).
 * 3. Render the app. Unsupported market prefixes render the 404 page
 *    (`routes/market-guard.ts`).
 * 4. Commit the session and apply Shopify's response headers.
 * 5. On a 404, look the path up in Shopify's URL redirects for its market.
 */
export default {
  async fetch(
    rawRequest: Request,
    env: Env,
    executionContext: ExecutionContext,
  ): Promise<Response> {
    try {
      const request = toPublicRequest(rawRequest);
      const url = new URL(request.url);

      const method = request.method;
      if ((method === "GET" || method === "HEAD") && request.body) {
        return new Response(`${method} requests cannot have a body`, {
          status: 400,
        });
      }
      if (url.pathname.includes("//")) {
        return new Response(null, {
          status: 301,
          headers: { location: url.pathname.replace(/\/+/g, "/") },
        });
      }

      const appContext = await createAppContext(request, env, executionContext);
      const { session, storefront } = appContext;
      const requestContext = storefront.requestContext;

      // Hydrogen answers cart permalinks (`/cart/<variant>:<qty>`) with
      // Shopify's own permalink and defaults them to Shop Pay. That is what
      // the Shop Pay button links to (it always passes `payment`), but a
      // merchant's marketing link must keep Pilot's behavior: a cart in the
      // shopper's market, `?discount=`, and attribution forwarded to the
      // regular checkout (`routes/cart/lines.tsx`).
      const isPilotCartPermalink =
        CART_PERMALINK_PATH.test(url.pathname) &&
        !url.searchParams.has("payment");

      const shopifyRoute = isPilotCartPermalink
        ? null
        : handleShopifyRoutes({
            request,
            requestContext,
            sessionManager: session,
            storefrontClient: storefront,
            routeTemplates,
            // Pilot's cart handlers come first: its `POST /api/cart` syncs the
            // cart's market and then delegates to Hydrogen's handler.
            handlers: [
              createPilotCartHandlers({
                getCustomerAccessToken:
                  appContext.customerAccount.getAccessToken,
              }),
              cartHandlers,
              predictiveSearchHandlers,
              getCustomerAccountHandlers(env),
            ],
          });
      if (shopifyRoute) {
        const response = await shopifyRoute;
        await commitSession(response, appContext);
        return response;
      }

      const routerContext = Object.assign(
        new RouterContextProvider(),
        appContext,
      );
      const response = await handleRequest(request, routerContext);

      if (response.status === 404 && !isUnsupportedMarketPath(url.pathname)) {
        /**
         * Check Shopify's URL redirects only when the app answered 404, and
         * never for an unsupported market, whose lookup would fall back to the
         * default market. A matched redirect already carries Shopify's
         * response headers.
         */
        const redirect = await marketAwareRedirect(request, (lookupRequest) =>
          handleShopifyRedirects({
            request: lookupRequest,
            storefrontClient: storefront,
            routeTemplates,
          }),
        );
        if (redirect) return redirect;
      }

      await commitSession(response, appContext);
      requestContext.applyResponseHeaders(response.headers);
      return response;
    } catch (error) {
      console.error(error);
      return new Response("An unexpected error occurred", { status: 500 });
    }
  },
};

/** Appends the session cookie when the request changed the session. */
async function commitSession(
  response: Response,
  { session }: Awaited<ReturnType<typeof createAppContext>>,
) {
  const headers = new Headers((await session.commit()) ?? undefined);
  for (const [name, value] of headers) response.headers.append(name, value);
}

/**
 * Behind a proxy that terminates TLS, such as a tunnel, the worker sees
 * `http:` with `x-forwarded-proto: https`. Customer Account OAuth needs the
 * public `https:` origin.
 */
function toPublicRequest(request: Request): Request {
  const url = new URL(request.url);
  if (
    url.protocol !== "http:" ||
    request.headers.get("x-forwarded-proto") !== "https"
  ) {
    return request;
  }
  url.protocol = "https:";
  return new Request(url, request);
}
