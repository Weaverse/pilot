import { useTranslation } from "@weaverse/hydrogen/react-router";
import clsx from "clsx";
import { useRef } from "react";
import useScroll from "react-use/esm/useScroll";
import { Link } from "~/components/link";
import { ScrollArea } from "~/components/scroll-area";
import { Section } from "~/components/section";
import type { CartLayoutType } from "~/types/others";
import { CartBestSellers } from "./cart-best-sellers";
import { CartLineItem } from "./cart-line-item";
import { type CartData, type CartLineData, useCart } from "./cart-store";
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
  const { t } = useTranslation();

  return (
    <div
      ref={scrollRef}
      className={clsx(
        layout === "drawer" && [
          "h-screen-dynamic flex flex-col content-start justify-center space-y-12 overflow-y-scroll px-5 pb-5 text-center transition",
          y > 0 && "border-t",
        ],
        layout === "page" && [
          "w-full gap-4 pb-12 md:items-start md:gap-8 lg:gap-12",
        ],
      )}
      hidden={hidden}
    >
      <div className={clsx(layout === "page" && "text-center")}>
        <p className="mb-4">{t("cart.empty.message")}</p>
        <Link
          variant="outline"
          to="/products"
          className={clsx(
            layout === "drawer" ? "w-full" : "min-w-48",
            "justify-center",
          )}
          onClick={onClose}
        >
          {t("cart.empty.startShopping")}
        </Link>
      </div>
      {layout === "page" && (
        <Section width="fixed" verticalPadding="medium">
          <div className="grid gap-4">
            <CartBestSellers
              count={4}
              heading={t("cart.empty.shopBestSellers")}
              sortKey="BEST_SELLING"
            />
          </div>
        </Section>
      )}
    </div>
  );
}

// Only `CartLine` has a parent; a `ComponentizableCartLine` never does.
function getParentLineId(line: CartLineData) {
  return "parentRelationship" in line
    ? line.parentRelationship?.parent.id
    : undefined;
}

/**
 * React keys that survive the optimistic-to-confirmed line handoff.
 *
 * A new line is keyed `optimistic:<variant>` until Shopify answers with its
 * real ID. A unique variant identifies the same visual row before and after,
 * so keying by it keeps the row mounted and avoids image flicker. Carts with
 * duplicate merchandise (different attributes or selling plans) fall back to
 * Shopify line IDs to avoid key collisions.
 */
function getCartLineRenderKeys(lines: CartLineData[]) {
  const merchandiseCounts = new Map<string, number>();
  for (const line of lines) {
    const merchandiseId = line.merchandise?.id;
    if (merchandiseId) {
      merchandiseCounts.set(
        merchandiseId,
        (merchandiseCounts.get(merchandiseId) ?? 0) + 1,
      );
    }
  }
  return lines.map((line) => {
    const merchandiseId = line.merchandise?.id;
    return merchandiseId && merchandiseCounts.get(merchandiseId) === 1
      ? `merchandise-${merchandiseId}`
      : line.id;
  });
}

/**
 * The cart lines and summary, shared by the drawer and the `/cart` page.
 *
 * Renders the cart store. `serverCart` is the `/cart` loader's cart: it is
 * rendered until the store's first load lands, so the server-rendered page
 * (and the page without JavaScript) shows the shopper's real cart.
 */
export function CartMain({
  layout,
  onClose,
  serverCart,
}: {
  layout: CartLayoutType;
  onClose?: () => void;
  serverCart?: CartData | null;
}) {
  const scrollRef = useRef(null);
  const { y } = useScroll(scrollRef);
  const storeCart = useCart((state) => state.data);
  const loading = useCart((state) => state.loading);
  const cart = (loading && serverCart) || storeCart;
  const allLines = cart.lines.nodes;
  // Bundle components and add-ons are lines of their own that point at their
  // parent line; they render inside it, not as separate rows.
  const childLines = new Map<string, CartLineData[]>();
  for (const line of allLines) {
    const parentId = getParentLineId(line);
    if (parentId) {
      childLines.set(parentId, [...(childLines.get(parentId) ?? []), line]);
    }
  }
  const lines = allLines.filter((line) => !getParentLineId(line));
  const lineRenderKeys = getCartLineRenderKeys(lines);
  const cartHasItems = cart.totalQuantity > 0;

  return (
    <>
      <CartEmpty hidden={lines.length > 0} onClose={onClose} layout={layout} />
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
            className={clsx(layout === "drawer" && "max-h-[calc(100vh-260px)]")}
            size="sm"
          >
            <ul
              className={clsx(
                "grid px-4",
                layout === "page" && "gap-9",
                layout === "drawer" && "gap-5",
              )}
            >
              {lines.map((line, index) => (
                <CartLineItem
                  key={lineRenderKeys[index]}
                  line={line}
                  childLines={childLines.get(line.id)}
                  layout={layout}
                  onClose={onClose}
                />
              ))}
            </ul>
          </ScrollArea>
        </div>
        {cartHasItems && <CartSummary cart={cart} layout={layout} />}
      </div>
    </>
  );
}
