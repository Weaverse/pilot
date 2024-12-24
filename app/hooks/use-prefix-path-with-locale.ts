import { useRouteLoaderData } from "@remix-run/react";
import { DEFAULT_LOCALE } from "~/utils/const";
import type { RootLoader } from "~/root";

export function usePrefixPathWithLocale(path: string) {
  let rootData = useRouteLoaderData<RootLoader>("root");
  let { pathPrefix } = rootData?.selectedLocale ?? DEFAULT_LOCALE;
  let suffix = path.startsWith("/") ? path : `/${path}`;
  return pathPrefix + suffix;
}
