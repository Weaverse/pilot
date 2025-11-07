import { useOptimisticCart } from "@shopify/hydrogen";
import clsx from "clsx";
import { useRef } from "react";
import useScroll from "react-use/esm/useScroll";
import type { CartApiQueryFragment } from "storefront-api.generated";
import { Link } from "~/components/link";
import { ScrollArea } from "~/components/scroll-area";
import { Section } from "~/components/section";
import type { CartLayoutType } from "~/types/others";
import { CartBestSellers } from "./cart-best-sellers";
import { CartLineItem } from "./cart-line-item";
import { CartSummary } from "./cart-summary";

function CartEmpty({
  hidden = false,
  layout = "drawer",
  onClose,
}: {
  hidden: boolean;
  layout?: CartLayoutType;
  onClose?: () => void;
}) {
  const scrollRef = useRef(null);
  const { y } = useScroll(scrollRef);
  return (
    <div
      ref={scrollRef}
      className={clsx(
        layout === "drawer" && [
          "flex h-screen-dynamic flex-col content-start justify-center space-y-12 overflow-y-scroll px-5 pb-5 text-center transition",
          y > 0 && "border-t",
        ],
        layout === "page" && [
          "w-full gap-4 pb-12 md:items-start md:gap-8 lg:gap-12",
        ],
      )}
      hidden={hidden}
    >
      <div className={clsx(layout === "page" && "text-center")}>
        <p className="mb-4">
          Looks like you haven&rsquo;t added anything yet, let&rsquo;s get you
          started!
        </p>
        <Link
          variant="outline"
          to="/products"
          className={clsx(
            layout === "drawer" ? "w-full" : "min-w-48",
            "justify-center",
          )}
          onClick={onClose}
        >
          Start Shopping
        </Link>
      </div>
      {layout === "page" && (
        <Section width="fixed" verticalPadding="medium">
          <div className="grid gap-4">
            <CartBestSellers
              count={4}
              heading="Shop Best Sellers"
              sortKey="BEST_SELLING"
            />
          </div>
        </Section>
      )}
    </div>
  );
}

export function CartMain({
  layout,
  onClose,
  cart: originalCart,
}: {
  layout: CartLayoutType;
  onClose?: () => void;
  cart: CartApiQueryFragment;
}) {
  const scrollRef = useRef(null);
  const { y } = useScroll(scrollRef);
  const cart = useOptimisticCart<CartApiQueryFragment>(originalCart);
  const linesCount = Boolean(cart?.lines?.nodes?.length || 0);
  const cartHasItems = Boolean(cart) && cart.totalQuantity > 0;

  return (
    <>
      <CartEmpty hidden={linesCount} onClose={onClose} layout={layout} />
      <div
        className={clsx(
          layout === "drawer" &&
            "grid grow grid-cols-1 grid-rows-[1fr_auto] px-4",
          layout === "page" && [
            "mx-auto w-full max-w-(--page-width) pb-12",
            "grid md:items-start lg:grid-cols-[1fr_480px]",
            "gap-8 md:gap-8 lg:gap-12",
          ],
        )}
      >
        <div
          ref={scrollRef}
          className={clsx([
            "-mx-4 pb-4",
            y > 0 ? "border-line-subtle border-t" : "",
            layout === "page" && "grow md:translate-y-4",
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
              {(cart?.lines?.nodes ?? []).map((line) => (
                <CartLineItem key={line.id} line={line} layout={layout} />
              ))}
            </ul>
          </ScrollArea>
        </div>
        {cartHasItems && <CartSummary cart={cart} layout={layout} />}
      </div>
    </>
  );
}
