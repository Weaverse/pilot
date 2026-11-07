import type { MiddlewareFunction } from "react-router";
import { isUnsupportedMarketPath } from "~/utils/locale";

/**
 * Wraps the `:locale?` resource routes (APIs, sitemaps, redirects). A request
 * for a resource route runs only that route's loader, never the page guard's
 * (`routes/market-guard.ts`), so the guard runs as middleware, which React
 * Router calls for every matched route. Nothing renders, so a bare 404 is
 * enough.
 */
function guardMarket(
  { request }: { request: Request },
  next: () => Promise<Response>,
) {
  if (isUnsupportedMarketPath(new URL(request.url).pathname)) {
    throw new Response(null, { status: 404 });
  }
  return next();
}

export const middleware: MiddlewareFunction<Response>[] = [guardMarket];
