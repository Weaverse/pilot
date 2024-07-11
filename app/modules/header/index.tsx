import { Await } from "@remix-run/react";
import { CartForm } from "@shopify/hydrogen";
import { Suspense, useEffect } from "react";
import { useCartFetchers } from "~/hooks/useCartFetchers";
import { useIsHomePath, type EnhancedMenu } from "~/lib/utils";
import { useRootLoaderData } from "~/root";
import { Cart } from "../Cart";
import { CartLoading } from "../CartLoading";
import { Drawer, useDrawer } from "../Drawer";
import { DesktopHeader } from "./DesktopHeader";
import { MobileMenu } from "./menu/MobileMenu";
import { MobileHeader } from "./MobileHeader";

export function Header({
  title,
  menu,
}: {
  title: string;
  menu?: EnhancedMenu;
}) {
  const isHome = useIsHomePath();

  const {
    isOpen: isCartOpen,
    openDrawer: openCart,
    closeDrawer: closeCart,
  } = useDrawer();

  const {
    isOpen: isMenuOpen,
    openDrawer: openMenu,
    closeDrawer: closeMenu,
  } = useDrawer();

  const addToCartFetchers = useCartFetchers(CartForm.ACTIONS.LinesAdd);

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
      <DesktopHeader
        isHome={isHome}
        title={title}
        menu={menu}
        openCart={openCart}
      />
      <MobileHeader
        isHome={isHome}
        title={title}
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
  const rootData = useRootLoaderData();

  return (
    <Drawer open={isOpen} onClose={onClose} heading="Cart" openFrom="right">
      <div className="grid">
        <Suspense fallback={<CartLoading />}>
          <Await resolve={rootData?.cart}>
            {(cart) => <Cart layout="drawer" onClose={onClose} cart={cart} />}
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
      {<MobileMenu menu={menu} />}
    </Drawer>
  );
}
