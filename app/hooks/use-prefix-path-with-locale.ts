import { useLocation } from "react-router";
import { localizePath, resolveLocale } from "~/utils/locale";

/**
 * Prefixes an app path with the active market.
 *
 * The market is read from the URL rather than the root loader: with a
 * `url-path` strategy the URL *is* the market, so cart and API forms keep
 * posting to the right one even while a loader revalidation is in flight.
 */
export function usePrefixPathWithLocale(path: string) {
  const { pathname } = useLocation();

  return localizePath(path, resolveLocale(pathname));
}
