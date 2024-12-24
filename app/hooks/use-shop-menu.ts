import { useRouteLoaderData } from "@remix-run/react";
import type { RootLoader } from "~/root";
import type { EnhancedMenu } from "~/types/menu";

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
