import { useLocation, useRouteLoaderData } from "react-router";
import type { RootLoader } from "~/root";
import { DEFAULT_LOCALE, getLocalePrefixFromPath } from "~/utils/const";

export function usePrefixPathWithLocale(path: string) {
  const rootData = useRouteLoaderData<RootLoader>("root");
  const { pathname } = useLocation();
  // Derive the prefix from the current URL first so cart forms post to the
  // active locale's cart route. `||` (not `??`) lets the empty-string result
  // for a non-locale path fall through to the loader's selected locale.
  const pathPrefix =
    getLocalePrefixFromPath(pathname) ||
    rootData?.selectedLocale?.pathPrefix ||
    DEFAULT_LOCALE.pathPrefix;
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return pathPrefix + suffix;
}
