import { useRouteLoaderData } from "@remix-run/react";
import type { EnhancedMenu } from "~/lib/utils";
import type { RootLoader } from "~/root";

export function useShopMenu() {
  let { layout } = useRouteLoaderData<RootLoader>("root");
  let shopName = layout?.shop?.name;
  let headerMenu = layout?.headerMenu as EnhancedMenu;
  let footerMenu = layout?.footerMenu as EnhancedMenu;
  return {
    shopName,
    headerMenu,
    footerMenu,
  };
}
