import { useRouteLoaderData } from "react-router";
import type { RootLoader } from "~/root";
import type { EnhancedMenu } from "~/types/menu";

export function useShopMenu() {
  const { layout } = useRouteLoaderData<RootLoader>("root");
  const shopName = layout?.shop?.name;
  const headerMenu = layout?.headerMenu as EnhancedMenu;
  const footerMenu = layout?.footerMenu as EnhancedMenu;
  return {
    shopName,
    headerMenu,
    footerMenu,
  };
}
