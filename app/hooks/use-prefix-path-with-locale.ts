import { useRouteLoaderData } from "react-router";
import type { RootLoader } from "~/root";
import { DEFAULT_LOCALE } from "~/utils/const";

export function usePrefixPathWithLocale(path: string) {
  const rootData = useRouteLoaderData<RootLoader>("root");
  const { pathPrefix } = rootData?.selectedLocale ?? DEFAULT_LOCALE;
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return pathPrefix + suffix;
}
