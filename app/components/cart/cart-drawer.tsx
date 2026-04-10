import { ArrowRightIcon, HandbagIcon, XIcon } from "@phosphor-icons/react";
import * as Dialog from "@radix-ui/react-dialog";
import { useAnalytics, useOptimisticCart } from "@shopify/hydrogen";
import clsx from "clsx";
import { Suspense, useEffect } from "react";
import { Await, useLocation, useRouteLoaderData } from "react-router";
import type { CartApiQueryFragment } from "storefront-api.generated";
import { CartMain } from "~/components/cart/cart-main";
import Link from "~/components/link";
import type { RootLoader } from "~/root";
import { useCartDrawerStore } from "./store";

export function CartDrawer() {
  const rootData = useRouteLoaderData<RootLoader>("root");
  const {
    isOpen,
    close: closeCartDrawer,
    toggle: toggleCartDrawer,
  } = useCartDrawerStore();
  const location = useLocation();

  // biome-ignore lint/correctness/useExhaustiveDependencies: close on route change
  useEffect(() => {
    closeCartDrawer();
  }, [location.pathname, closeCartDrawer]);

  return (
    <Suspense
      fallback={
        <Link
          to="/cart"
          className="relative flex h-8 w-8 items-center justify-center focus:ring-border"
        >
          <HandbagIcon className="h-5 w-5" />
        </Link>
      }
    >
      <Await resolve={rootData?.cart}>
        {(cart) => (
          <CartDrawerContent
            cart={cart}
            isOpen={isOpen}
            toggleCartDrawer={toggleCartDrawer}
            closeCartDrawer={closeCartDrawer}
          />
        )}
      </Await>
    </Suspense>
  );
}

function CartDrawerContent({
  cart: originalCart,
  isOpen,
  toggleCartDrawer,
  closeCartDrawer,
}: {
  cart: CartApiQueryFragment | null;
  isOpen: boolean;
  toggleCartDrawer: () => void;
  closeCartDrawer: () => void;
}) {
  const { publish } = useAnalytics();
  const cart = useOptimisticCart(originalCart);

  return (
    <Dialog.Root open={isOpen} onOpenChange={toggleCartDrawer}>
      <Dialog.Trigger
        onClick={() => publish("custom_sidecart_viewed", { cart })}
        className="relative flex h-8 w-8 items-center justify-center focus:ring-border"
      >
        <HandbagIcon className="h-5 w-5" />
        {cart?.totalQuantity > 0 && (
          <div
            className={clsx(
              "cart-count",
              "-right-1.5 absolute top-0",
              "flex h-4.5 min-w-4.5 items-center justify-center rounded-full px-1 text-center",
              "text-center font-medium text-[13px] leading-none",
              "transition-colors duration-300",
              "group-hover/header:bg-(--color-header-text)",
              "group-hover/header:text-(--color-header-bg)",
            )}
          >
            <span>{cart?.totalQuantity}</span>
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
            "fixed inset-y-0 right-0 z-10 w-screen max-w-120 bg-background py-4",
            "data-[state=open]:animate-[enter-from-right_200ms_ease-out]",
            "data-[state=closed]:animate-[exit-to-right_200ms_ease-in]",
          )}
          aria-describedby={undefined}
        >
          <div className="flex h-full flex-col space-y-6">
            <div className="flex items-center justify-between gap-2 px-4">
              <Dialog.Title asChild className="text-base">
                <Link
                  to="/cart"
                  className="group/cart-title flex items-center gap-1.5 font-bold hover:underline"
                  onClick={closeCartDrawer}
                >
                  Cart ({cart?.totalQuantity || 0})
                  <ArrowRightIcon className="size-4 transition-transform group-hover/cart-title:translate-x-0.5" />
                </Link>
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="translate-x-2 p-2"
                  aria-label="Close cart drawer"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>
            <CartMain layout="drawer" cart={cart} />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
