import { Handbag, X } from "@phosphor-icons/react";
import * as Dialog from "@radix-ui/react-dialog";
import { Await, useRouteLoaderData } from "@remix-run/react";
import { type CartReturn, useAnalytics } from "@shopify/hydrogen";
import clsx from "clsx";
import { Suspense, useState } from "react";
import Link from "~/components/link";
import { ScrollArea } from "~/components/scroll-area";
import { Cart } from "~/components/cart/cart";
import type { RootLoader } from "~/root";

export let openCartDrawer = () => {};

export function CartDrawer() {
  let rootData = useRouteLoaderData<RootLoader>("root");
  let { publish } = useAnalytics();
  let [open, setOpen] = useState(false);
  openCartDrawer = () => setOpen(true);

  // Toggle cart drawer when adding to cart
  // let addToCartFetchers = useCartFetchers(CartForm.ACTIONS.LinesAdd);
  // useEffect(() => {
  //   if (!open && addToCartFetchers.length) {
  //     setOpen(true);
  //   }
  // }, [addToCartFetchers, open]);

  return (
    <Suspense
      fallback={
        <Link
          to="/cart"
          className="relative flex items-center justify-center w-8 h-8 focus:ring-border"
        >
          <Handbag className="w-5 h-5" />
        </Link>
      }
    >
      <Await resolve={rootData?.cart}>
        {(cart) => (
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger
              onClick={() => publish("custom_sidecart_viewed", { cart })}
              className="relative flex items-center justify-center w-8 h-8 focus:ring-border"
            >
              <Handbag className="w-5 h-5" />
              {cart?.totalQuantity > 0 && (
                <div
                  className={clsx(
                    "cart-count",
                    "absolute top-0 -right-1.5",
                    "flex items-center text-center justify-center min-w-4.5 h-4.5 px-1 rounded-full",
                    "text-sm leading-none text-center font-medium",
                    "transition-colors duration-300",
                    "group-hover/header:bg-[--color-header-text]",
                    "group-hover/header:text-[--color-header-bg]"
                  )}
                >
                  <span className="-mr-px">{cart?.totalQuantity}</span>
                </div>
              )}
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay
                className="fixed inset-0 bg-black/50 data-[state=open]:animate-fade-in z-10"
                style={{ "--fade-in-duration": "100ms" } as React.CSSProperties}
              />
              <Dialog.Content
                className={clsx([
                  "fixed inset-y-0 w-screen max-w-[400px] bg-[--color-background] py-4 z-10",
                  "right-0 translate-x-full data-[state=open]:animate-enter-from-right",
                ])}
                aria-describedby={undefined}
              >
                <div className="space-y-6">
                  <div className="flex gap-2 items-center justify-between px-4">
                    <Dialog.Title asChild className="py-2.5">
                      <span className="font-bold">Cart</span>
                    </Dialog.Title>
                    <Dialog.Close asChild>
                      <button
                        className="p-2 translate-x-2"
                        aria-label="Close cart drawer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </Dialog.Close>
                  </div>
                  <ScrollArea className="max-h-[calc(100vh-4.5rem)]" size="sm">
                    <Cart layout="drawer" cart={cart as CartReturn} />
                  </ScrollArea>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        )}
      </Await>
    </Suspense>
  );
}
