import { useRouteLoaderData } from "@remix-run/react";
import type {
  ChildMenuItemFragment,
  MenuFragment,
  ParentMenuItemFragment,
} from "storefrontapi.generated";
import type { RootLoader } from "~/root";

type EnhancedMenuItemProps = {
  to: string;
  target: string;
  isExternal?: boolean;
};

type ChildEnhancedMenuItem = ChildMenuItemFragment & EnhancedMenuItemProps;

type ParentEnhancedMenuItem = (ParentMenuItemFragment &
  EnhancedMenuItemProps) & {
  items: ChildEnhancedMenuItem[];
};

export type EnhancedMenu = Pick<MenuFragment, "id"> & {
  items: ParentEnhancedMenuItem[];
};

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
