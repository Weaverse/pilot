import type { LoaderFunctionArgs } from "react-router";
import { isUnsupportedMarketPath } from "~/utils/locale";

/**
 * Wraps every `:locale?` route. A market-shaped prefix Pilot does not sell in
 * (`/en-xx/products/hoodie`) must not resolve: `resolveLocale` falls back to
 * the default market so link and sitemap helpers never throw, and serving
 * that fallback would publish the catalogue at unlimited non-canonical URLs.
 *
 * Throwing here, below the root route, keeps the root loader's data, so the
 * root `ErrorBoundary` renders the regular 404 page inside the header and
 * footer, for documents and client navigations (`.data`) alike.
 */
export function loader({ request }: LoaderFunctionArgs) {
  if (isUnsupportedMarketPath(new URL(request.url).pathname)) {
    throw new Response("page", { status: 404 });
  }
  return null;
}
