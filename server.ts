import * as remixBuild from "virtual:react-router/server-build"; // Virtual entry point for the app
import { storefrontRedirect } from "@shopify/hydrogen";
import { createRequestHandler } from "@shopify/hydrogen/oxygen";
import { createHydrogenRouterContext } from "~/.server/context";
import { marketAwareRedirect } from "~/.server/market-redirect";
import { isUnsupportedMarketPath } from "~/utils/locale";

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
      const requestUrl = new URL(request.url);

      if (isUnsupportedMarketPath(requestUrl.pathname)) {
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
         * Check for redirects only when there's a 404 from the app. If no
         * redirect exists, `storefrontRedirect` passes the 404 through.
         */
        return marketAwareRedirect(request, response, (lookupRequest) =>
          storefrontRedirect({
            request: lookupRequest,
            response,
            storefront: hydrogenContext.storefront,
          }),
        );
      }
      return response;
    } catch (error) {
      console.error(error);
      return new Response("An unexpected error occurred", { status: 500 });
    }
  },
};
