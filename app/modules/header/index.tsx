import { Await, useRouteLoaderData } from "@remix-run/react";
import { CartForm, type CartReturn } from "@shopify/hydrogen";
import { Suspense, useEffect } from "react";
import { useCartFetchers } from "~/hooks/use-cart-fetchers";
import type { EnhancedMenu } from "~/lib/utils";
import type { RootLoader } from "~/root";
import { Cart } from "~/modules/cart";
import { CartLoading } from "../cart-loading";
import { Drawer, useDrawer } from "../drawer";
import { AnnouncementBar } from "./announcement-bar";
import { DesktopHeader } from "./desktop-header";
import { MobileHeader } from "./mobile-header";
import { MobileMenu } from "./menu/mobile-menu";

export function Header({
  shopName,
  menu,
}: {
  shopName: string;
  menu?: EnhancedMenu;
}) {
  let {
    isOpen: isCartOpen,
    openDrawer: openCart,
    closeDrawer: closeCart,
  } = useDrawer();
  let {
    isOpen: isMenuOpen,
    openDrawer: openMenu,
    closeDrawer: closeMenu,
  } = useDrawer();

  let addToCartFetchers = useCartFetchers(CartForm.ACTIONS.LinesAdd);
  // toggle cart drawer when adding to cart
  useEffect(() => {
    if (isCartOpen || !addToCartFetchers.length) return;
    openCart();
  }, [addToCartFetchers, isCartOpen, openCart]);

  return (
    <>
      <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
      {menu && (
        <MenuDrawer isOpen={isMenuOpen} onClose={closeMenu} menu={menu} />
      )}
      <AnnouncementBar />
      <DesktopHeader shopName={shopName} menu={menu} openCart={openCart} />
      <MobileHeader
        shopName={shopName}
        openCart={openCart}
        openMenu={openMenu}
      />
    </>
  );
}

function CartDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const rootData = useRouteLoaderData<RootLoader>("root");

  return (
    <Drawer open={isOpen} onClose={onClose} heading="Cart" openFrom="right">
      <div className="grid">
        <Suspense fallback={<CartLoading />}>
          <Await resolve={rootData?.cart}>
            {(cart) => (
              <Cart
                layout="drawer"
                onClose={onClose}
                cart={cart as CartReturn}
              />
            )}
          </Await>
        </Suspense>
      </div>
    </Drawer>
  );
}

export function MenuDrawer({
  isOpen,
  onClose,
  menu,
}: {
  isOpen: boolean;
  onClose: () => void;
  menu: EnhancedMenu;
}) {
  return (
    <Drawer
      bordered
      open={isOpen}
      onClose={onClose}
      openFrom="left"
      heading="MENU"
      spacing="sm"
    >
      <MobileMenu menu={menu} />
    </Drawer>
  );
}
