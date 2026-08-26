import {
  createContentSecurityPolicy,
  type HydrogenRouterContextProvider,
} from "@shopify/hydrogen";
import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";
import type { EntryContext } from "react-router";
import { ServerRouter } from "react-router";
import { getFullPageCacheControl } from "~/utils/full-page-cache";
import { getWeaverseCsp } from "~/weaverse/csp";

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
  context: HydrogenRouterContextProvider,
) {
  const { nonce, header, NonceProvider } = createContentSecurityPolicy({
    ...getWeaverseCsp(request, context),
    shop: {
      checkoutDomain:
        context.env?.PUBLIC_CHECKOUT_DOMAIN || context.env?.PUBLIC_STORE_DOMAIN,
      storeDomain: context.env?.PUBLIC_STORE_DOMAIN,
    },
  });

  const body = await renderToReadableStream(
    <NonceProvider>
      <ServerRouter
        context={reactRouterContext}
        url={request.url}
        nonce={nonce}
      />
    </NonceProvider>,
    {
      nonce,
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
  // TODO: change to Content-Security-Policy when you ready with your CSP configs.
  responseHeaders.set("Content-Security-Policy-Report-Only", header);
  // Opt anonymous document responses into Oxygen's full-page cache. Both
  // headers are required by Oxygen; responses that commit a session cookie
  // (Set-Cookie in server.ts) are excluded by Oxygen automatically. See
  // app/utils/full-page-cache.ts for the gating rules.
  const fullPageCacheControl = getFullPageCacheControl(
    request,
    responseStatusCode,
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
