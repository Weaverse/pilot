import { CartForm } from "@shopify/hydrogen";
import { useEffect } from "react";
import { useCartFetchers } from "~/hooks/use-cart-fetchers";
import { useDrawer } from "../../modules/drawer";
import { DesktopHeader } from "./desktop-header";
import { MobileHeader } from "./mobile-header";
import { ScrollingAnnouncement } from "./scrolling-announcement";

export function Header() {
  let { isOpen: isCartOpen, openDrawer: openCart } = useDrawer();

  let addToCartFetchers = useCartFetchers(CartForm.ACTIONS.LinesAdd);
  // toggle cart drawer when adding to cart
  useEffect(() => {
    if (isCartOpen || !addToCartFetchers.length) return;
    openCart();
  }, [addToCartFetchers, isCartOpen, openCart]);

  return (
    <>
      <ScrollingAnnouncement />
      <DesktopHeader />
      <MobileHeader />
    </>
  );
}
