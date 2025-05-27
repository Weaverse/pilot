import { useRouteLoaderData } from "react-router";
import type { RootLoader } from "~/root";
import { DEFAULT_LOCALE } from "~/utils/const";

export function usePrefixPathWithLocale(path: string) {
  let rootData = useRouteLoaderData<RootLoader>("root");
  let { pathPrefix } = rootData?.selectedLocale ?? DEFAULT_LOCALE;
  let suffix = path.startsWith("/") ? path : `/${path}`;
  return pathPrefix + suffix;
}
