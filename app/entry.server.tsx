import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";
import type { EntryContext, RouterContextProvider } from "react-router";
import { createContentSecurityPolicy } from "@shopify/hydrogen";
import { ServerRouter } from "react-router";
import { getFullPageCacheControl } from "~/utils/full-page-cache";
import { getCspDirectives } from "~/weaverse/csp";

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
  context: RouterContextProvider,
) {
  // No nonce: a per-response nonce would make the HTML uncacheable, and the
  // document is stored by Oxygen's full-page cache (see below).
  const csp = createContentSecurityPolicy({
    nonce: false,
    shop: {
      checkoutDomain: context.env?.PUBLIC_CHECKOUT_DOMAIN || undefined,
      storeDomain: context.env?.PUBLIC_STORE_DOMAIN || undefined,
    },
    directives: getCspDirectives(request),
  });

  const body = await renderToReadableStream(
    <ServerRouter context={reactRouterContext} url={request.url} />,
    {
      signal: request.signal,
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get("user-agent"))) {
    await Promise.race([
      body.allReady,
      new Promise((resolve) => setTimeout(resolve, 2000)),
    ]);
  }

  responseHeaders.set("Content-Type", "text/html");
  // TODO: change to Content-Security-Policy (`csp.applyResponseHeaders`) when
  // you are ready with your CSP configs. Each store decides when to enforce.
  responseHeaders.set("Content-Security-Policy-Report-Only", csp.header);
  // Opt anonymous document responses into Oxygen's full-page cache. Both
  // headers are required by Oxygen; responses that commit a session cookie
  // (Set-Cookie in server.ts) are excluded by Oxygen automatically. See
  // app/utils/full-page-cache.ts for the gating rules.
  const fullPageCacheControl = getFullPageCacheControl(
    request,
    responseStatusCode,
    responseHeaders.get("Cache-Control"),
  );
  if (fullPageCacheControl) {
    responseHeaders.set("Oxygen-Cache-Control", fullPageCacheControl);
    if (!responseHeaders.has("Vary")) {
      responseHeaders.set("Vary", "Accept-Encoding");
    }
  }

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
