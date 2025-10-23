import { type OptimisticCart, useOptimisticCart } from "@shopify/hydrogen";
import clsx from "clsx";
import { useRef } from "react";
import useScroll from "react-use/esm/useScroll";
import type { CartApiQueryFragment } from "storefront-api.generated";
import { ScrollArea } from "~/components/scroll-area";
import type { CartLayoutType } from "~/types/others";
import { CartDiscounts } from "./cart-discounts";
import { CartEmpty } from "./cart-empty";
import { CartLineItem } from "./cart-line-item";
import { CartCheckoutActions, CartSummary } from "./cart-summary";

type CartLine = OptimisticCart<CartApiQueryFragment>["lines"]["nodes"][0];

export function CartMain({
  layout,
  onClose,
  cart: originalCart,
}: {
  layout: CartLayoutType;
  onClose?: () => void;
  cart: CartApiQueryFragment;
}) {
  const cart = useOptimisticCart<CartApiQueryFragment>(originalCart);
  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const cartHasItems = Boolean(cart) && cart.totalQuantity > 0;

  return (
    <>
      <CartEmpty hidden={linesCount} onClose={onClose} layout={layout} />
      <CartDetails cart={cart} layout={layout} cartHasItems={cartHasItems} />
    </>
  );
}

function CartDetails({
  layout,
  cart,
  cartHasItems,
}: {
  layout: CartLayoutType;
  cart: OptimisticCart<CartApiQueryFragment>;
  cartHasItems: boolean;
}) {
  return (
    <div
      className={clsx(
        layout === "drawer" &&
          "grid grow grid-cols-1 grid-rows-[1fr_auto] px-4",
        layout === "page" && [
          "mx-auto w-full max-w-(--page-width) pb-12",
          "grid md:grid-cols-2 md:items-start lg:grid-cols-3",
          "gap-8 md:gap-8 lg:gap-12",
        ],
      )}
    >
      <CartLines lines={cart?.lines?.nodes ?? []} layout={layout} />
      {cartHasItems && (
        <CartSummary cost={cart.cost} layout={layout}>
          <CartDiscounts discountCodes={cart.discountCodes} />
          <CartCheckoutActions checkoutUrl={cart.checkoutUrl} layout={layout} />
        </CartSummary>
      )}
    </div>
  );
}

function CartLines({
  layout = "drawer",
  lines,
}: {
  layout: CartLayoutType;
  lines: CartLine[];
}) {
  const scrollRef = useRef(null);
  const { y } = useScroll(scrollRef);

  return (
    <div
      ref={scrollRef}
      className={clsx([
        "-mx-4 pb-4",
        y > 0 ? "border-line-subtle border-t" : "",
        layout === "page" && "grow md:translate-y-4 lg:col-span-2",
        layout === "drawer" && "transition",
      ])}
    >
      <ScrollArea
        className={clsx(layout === "drawer" && "max-h-[calc(100vh-312px)]")}
        size="sm"
      >
        <ul
          className={clsx(
            "grid px-4",
            layout === "page" && "gap-9",
            layout === "drawer" && "gap-5",
          )}
        >
          {lines.map((line) => (
            <CartLineItem key={line.id} line={line} layout={layout} />
          ))}
        </ul>
      </ScrollArea>
    </div>
  );
}
