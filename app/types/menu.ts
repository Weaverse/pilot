import type { LayoutQuery } from "~/.server/root";

export type MenuFragment = NonNullable<LayoutQuery["headerMenu"]>;
export type ParentMenuItemFragment = MenuFragment["items"][number];
export type MenuItemFragment = ParentMenuItemFragment["items"][number];
export type ChildMenuItemFragment = Omit<MenuItemFragment, "items">;

type EnhancedMenuItemProps = {
  to: string;
  target: string;
  isExternal?: boolean;
};

type ChildEnhancedMenuItem = ChildMenuItemFragment & EnhancedMenuItemProps;

type ParentEnhancedMenuItem = (Omit<ParentMenuItemFragment, "items"> &
  EnhancedMenuItemProps) & {
  items: ChildEnhancedMenuItem[];
};

export type EnhancedMenu = Pick<MenuFragment, "id"> & {
  items: ParentEnhancedMenuItem[];
};

export interface SingleMenuItem {
  id: string;
  title: string;
  items: SingleMenuItem[];
  to: string;
  isExternal?: boolean;
  target: string;
  type: string;
  resource?: {
    image?: {
      altText: string;
      height: number;
      id: string;
      url: string;
      width: number;
    };
  };
}
