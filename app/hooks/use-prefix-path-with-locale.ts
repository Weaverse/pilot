import { useLocation, useRouteLoaderData } from "react-router";
import type { RootLoader } from "~/root";
import { DEFAULT_LOCALE } from "~/utils/const";

export function usePrefixPathWithLocale(path: string) {
  const rootData = useRouteLoaderData<RootLoader>("root");
  const { pathname } = useLocation();
  const pathPrefix =
    getPathPrefixFromPathname(pathname) ??
    rootData?.selectedLocale?.pathPrefix ??
    DEFAULT_LOCALE.pathPrefix;
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return pathPrefix + suffix;
}

function getPathPrefixFromPathname(pathname: string) {
  const firstPathPart = `/${pathname.substring(1).split("/")[0].toLowerCase()}`;
  return firstPathPart.length > 1 ? firstPathPart : "";
}
