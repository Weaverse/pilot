import { createContentSecurityPolicy } from "@shopify/hydrogen";
import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";
import type { AppLoadContext, EntryContext } from "react-router";
import { ServerRouter } from "react-router";

import { getWeaverseCsp } from "~/weaverse/csp";

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
  context: AppLoadContext,
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
      onError(_error) {
        responseStatusCode = 500;
      },
    },
  );

  if (isbot(request.headers.get("user-agent"))) {
    await body.allReady;
  }

  responseHeaders.set("Content-Type", "text/html");
  // TODO: change to Content-Security-Policy when you ready with your CSP configs.
  responseHeaders.set("Content-Security-Policy-Report-Only", header);
  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
