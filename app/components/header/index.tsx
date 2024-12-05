import { Await, useRouteLoaderData } from "@remix-run/react";
import { CartForm, type CartReturn } from "@shopify/hydrogen";
import { Suspense, useEffect } from "react";
import { useCartFetchers } from "~/hooks/use-cart-fetchers";
import { Cart } from "~/modules/cart";
import type { RootLoader } from "~/root";
import { CartLoading } from "../../modules/cart-loading";
import { Drawer, useDrawer } from "../../modules/drawer";
import { DesktopHeader } from "./desktop-header";
import { MobileHeader } from "./mobile-header";
import { ScrollingAnnouncement } from "./scrolling-announcement";

export function Header() {
  let {
    isOpen: isCartOpen,
    openDrawer: openCart,
    closeDrawer: closeCart,
  } = useDrawer();

  let addToCartFetchers = useCartFetchers(CartForm.ACTIONS.LinesAdd);
  // toggle cart drawer when adding to cart
  useEffect(() => {
    if (isCartOpen || !addToCartFetchers.length) return;
    openCart();
  }, [addToCartFetchers, isCartOpen, openCart]);

  return (
    <>
      {/* <CartDrawer isOpen={isCartOpen} onClose={closeCart} /> */}
      <ScrollingAnnouncement />
      <DesktopHeader />
      <MobileHeader openCart={openCart} />
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
