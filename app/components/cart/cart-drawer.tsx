import * as Dialog from "@radix-ui/react-dialog";
import clsx from "clsx";
import { useEffect } from "react";
import { useLocation } from "react-router";
import { create } from "zustand";
import { CartMain } from "~/components/cart/cart-main";
import { Icon } from "~/components/icon";
import Link from "~/components/link";
import { ShopifyInboxOverlayGuard } from "~/components/shopify-inbox";
import { Spinner } from "~/components/spinner";
import { CartErrorBanner } from "./cart-error-banner";
import { type CartData, useCart } from "./cart-store";

const useCartDrawerStore = create<{ isOpen: boolean }>()(() => ({
  isOpen: false,
}));

/**
 * Opens the cart drawer. Add-to-cart surfaces call it when they submit, so the
 * drawer shows the optimistic line in the same frame as the click.
 */
export function openCartDrawer() {
  useCartDrawerStore.setState({ isOpen: true });
}

export function closeCartDrawer() {
  useCartDrawerStore.setState({ isOpen: false });
}

/**
 * Standard Actions dispatches this event for every cart line change, from a
 * form or from code. An `add` opens the drawer, so a surface that doesn't call
 * `openCartDrawer()` itself still behaves like the rest. A cart that loads on
 * page view dispatches nothing, so the drawer never opens on load.
 */
const CART_LINES_UPDATE_EVENT = "shopify:cart:lines-update";

function openOnAdd(event: Event) {
  if ((event as Event & { action?: string }).action === "add") {
    openCartDrawer();
  }
}

/** GTM-only event: the 2026.10 analytics bus has no custom events. */
function publishSidecartViewed(cart: CartData) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "custom_sidecart_viewed",
    cart_id: cart.id,
    cart_total: cart.cost?.totalAmount?.amount,
    cart_total_quantity: cart.totalQuantity,
  });
}

export function CartDrawer() {
  const isOpen = useCartDrawerStore((state) => state.isOpen);
  const cart = useCart((state) => state.data);
  // Returning shoppers have a cart cookie, but the store holds an empty cart
  // until its `/api/cart` load responds — rendering CartMain then would show a
  // false "empty cart". Hold a loading state until the load lands. An add
  // clicked on a cold page projects its line immediately, so the drawer shows
  // that line instead of the spinner.
  const cartReady = useCart(
    (state) => !state.loading || state.pending.lines.size > 0,
  );
  const location = useLocation();

  useEffect(() => {
    document.addEventListener(CART_LINES_UPDATE_EVENT, openOnAdd);
    return () =>
      document.removeEventListener(CART_LINES_UPDATE_EVENT, openOnAdd);
  }, []);

  // Close on route change.
  // oxlint-disable-next-line react/exhaustive-deps -- close on route change
  useEffect(closeCartDrawer, [location.pathname]);

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => useCartDrawerStore.setState({ isOpen: open })}
    >
      <Dialog.Trigger
        onClick={() => publishSidecartViewed(cart)}
        className="focus:ring-border relative flex h-8 w-8 items-center justify-center"
      >
        <Icon name="handbag" className="h-5 w-5" />
        {cart.totalQuantity > 0 && (
          <div
            className={clsx(
              "cart-count",
              "absolute top-0 -right-1.5",
              "flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-center",
              "text-center text-[13px] leading-none font-medium",
              "transition-colors duration-300",
              "group-hover/header:bg-(--color-header-text)",
              "group-hover/header:text-(--color-header-bg)",
            )}
          >
            <span>{cart.totalQuantity}</span>
          </div>
        )}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay
          className={clsx(
            "fixed inset-0 z-10 bg-black/50",
            "data-[state=open]:animate-[fade-in_150ms_ease-out]",
            "data-[state=closed]:animate-[fade-out_150ms_ease-in]",
          )}
        />
        <Dialog.Content
          onCloseAutoFocus={(e) => e.preventDefault()}
          className={clsx(
            "bg-background fixed inset-y-0 right-0 z-10 w-screen max-w-120 py-4",
            "data-[state=open]:animate-[enter-from-right_200ms_ease-out]",
            "data-[state=closed]:animate-[exit-to-right_200ms_ease-in]",
          )}
          aria-describedby={undefined}
        >
          <ShopifyInboxOverlayGuard />
          <div className="flex h-full flex-col space-y-6">
            <div className="flex items-center justify-between gap-2 px-4">
              <Dialog.Title asChild className="text-base">
                <Link
                  to="/cart"
                  className="group/cart-title flex items-center gap-1.5 font-serif text-lg font-semibold hover:underline"
                  onClick={closeCartDrawer}
                >
                  Cart
                  {cartReady && ` (${cart.totalQuantity || 0})`}
                  <Icon
                    name="arrow-right"
                    className="size-4 transition-transform group-hover/cart-title:translate-x-0.5"
                  />
                </Link>
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="translate-x-2 p-2"
                  aria-label="Close cart drawer"
                >
                  <Icon name="x" className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>
            <CartErrorBanner className="mx-4" />
            {cartReady ? (
              <CartMain layout="drawer" onClose={closeCartDrawer} />
            ) : (
              <div
                className="relative grow"
                role="status"
                aria-label="Loading cart"
              >
                <Spinner />
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
