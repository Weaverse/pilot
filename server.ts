import * as remixBuild from "virtual:react-router/server-build"; // Virtual entry point for the app
import { storefrontRedirect } from "@shopify/hydrogen";
import { createRequestHandler } from "@shopify/hydrogen/oxygen";
import { createHydrogenRouterContext } from "~/.server/context";
import {
  delocalizePath,
  isUnsupportedMarketPath,
  localizePath,
  resolveLocaleFromRequest,
} from "~/utils/locale";

/**
 * Export a fetch handler in module format.
 */
export default {
  async fetch(
    request: Request,
    env: Env,
    executionContext: ExecutionContext,
  ): Promise<Response> {
    try {
      const hydrogenContext = await createHydrogenRouterContext(
        request,
        env,
        executionContext,
      );

      /**
       * Create a Remix request handler and pass
       * Hydrogen's Storefront client to the loader context.
       */
      const handleRequest = createRequestHandler({
        build: remixBuild,
        mode: process.env.NODE_ENV,
        getLoadContext: () => hydrogenContext,
      });

      /**
       * A market-shaped prefix we do not sell in (`/en-xx/products/hoodie`)
       * must not resolve. `resolveLocale` falls back to the default market so
       * link and sitemap helpers never throw, but serving that fallback to a
       * visitor would publish the entire catalogue at unlimited non-canonical
       * URLs. Refusing here covers every route, including `.data` requests,
       * rather than asking each loader to remember.
       */
      if (isUnsupportedMarketPath(new URL(request.url).pathname)) {
        return new Response("Not Found", { status: 404 });
      }

      const response = await handleRequest(request);

      if (hydrogenContext.session.isPending) {
        response.headers.set(
          "Set-Cookie",
          await hydrogenContext.session.commit(),
        );
      }

      if (response.status === 404) {
        /**
         * Check for redirects only when there's a 404 from the app.
         * If the redirect doesn't exist, then `storefrontRedirect`
         * will pass through the 404 response.
         *
         * Shopify stores URL redirects on market-neutral paths, and
         * `storefrontRedirect` matches on the request path verbatim. A
         * localized URL would therefore never match: `/collections/all`
         * redirects on the default market while `/de-de/collections/all`
         * 404s. Look the redirect up market-neutral, then put the market back
         * on the target so the shopper stays where they were shopping.
         */
        const locale = resolveLocaleFromRequest(request);
        const url = new URL(request.url);
        const neutralPath = delocalizePath(url.pathname);

        if (neutralPath === url.pathname) {
          return storefrontRedirect({
            request,
            response,
            storefront: hydrogenContext.storefront,
          });
        }

        url.pathname = neutralPath;
        const redirected = await storefrontRedirect({
          request: new Request(url, request),
          response,
          storefront: hydrogenContext.storefront,
        });
        const location = redirected.headers.get("Location");

        if (!location || redirected.status === 404) {
          return response;
        }

        const target = new URL(location, url);
        const localized =
          target.origin === url.origin
            ? new URL(
                localizePath(target.pathname, locale) + target.search,
                url,
              ).toString()
            : location;

        // `Headers` overwrites on `set`; spreading into an object literal
        // would append a second Location and produce a comma-joined value.
        const headers = new Headers(redirected.headers);
        headers.set("Location", localized);

        return new Response(null, { status: redirected.status, headers });
      }

      return response;
    } catch (error) {
      console.error(error);
      return new Response("An unexpected error occurred", { status: 500 });
    }
  },
};
