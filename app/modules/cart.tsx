import {
  CartForm,
  Image,
  Money,
  type OptimisticCart,
  OptimisticInput,
  useOptimisticCart,
  useOptimisticData,
} from "@shopify/hydrogen";
import type {
  CartLineUpdateInput,
  Cart as CartType,
} from "@shopify/hydrogen/storefront-api-types";
import clsx from "clsx";
import { useRef } from "react";
import useScroll from "react-use/esm/useScroll";
import type { CartApiQueryFragment } from "storefrontapi.generated";
import { Link } from "~/components/link";
import Button from "~/components/button";
import { IconTrash } from "~/components/icons";
import { getImageAspectRatio } from "~/lib/utils";
import { Text } from "~/modules/text";
import { CartBestSellers } from "./cart-best-sellers";

type CartLine = OptimisticCart<CartApiQueryFragment>["lines"]["nodes"][0];
type Layouts = "page" | "drawer";

export function Cart({
  layout,
  onClose,
  cart,
}: {
  layout: Layouts;
  onClose?: () => void;
  cart: CartApiQueryFragment;
}) {
  let optimisticCart = useOptimisticCart<CartApiQueryFragment>(cart);
  let linesCount = Boolean(optimisticCart?.lines?.nodes?.length || 0);
  let cartHasItems = !!cart && cart.totalQuantity > 0;

  if (cartHasItems) {
    return <CartDetails cart={optimisticCart} layout={layout} />;
  }
  return <CartEmpty hidden={linesCount} onClose={onClose} layout={layout} />;
}

export function CartDetails({
  layout,
  cart,
}: {
  layout: Layouts;
  cart: OptimisticCart<CartApiQueryFragment>;
}) {
  return (
    <div
      className={clsx(
        layout === "drawer" &&
          "grid grid-cols-1 h-screen-no-nav grid-rows-[1fr_auto] w-[400px]",
        layout === "page" && [
          "pb-12 w-full max-w-page mx-auto",
          "grid md:grid-cols-2 lg:grid-cols-3 md:items-start",
          "gap-8 md:gap-8 lg:gap-12",
        ],
      )}
    >
      <CartLines lines={cart?.lines?.nodes} layout={layout} />
      <CartSummary cost={cart.cost} layout={layout}>
        <CartDiscounts discountCodes={cart.discountCodes} />
        <CartCheckoutActions checkoutUrl={cart.checkoutUrl} layout={layout} />
      </CartSummary>
    </div>
  );
}

/**
 * Temporary discount UI
 * @param discountCodes the current discount codes applied to the cart
 * @todo rework when a design is ready
 */
function CartDiscounts({
  discountCodes,
}: {
  discountCodes: CartType["discountCodes"];
}) {
  let codes: string[] =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({ code }) => code) || [];

  return (
    <>
      {/* Have existing discount, display it with a remove option */}
      <dl className={codes && codes.length !== 0 ? "grid" : "hidden"}>
        <div className="flex items-center justify-between font-medium">
          <Text as="dt">Discount(s)</Text>
          <div className="flex items-center justify-between">
            <UpdateDiscountForm>
              <button type="button">
                <IconTrash
                  aria-hidden="true"
                  className="h-[18px] w-[18px] mr-1"
                />
              </button>
            </UpdateDiscountForm>
            <Text as="dd">{codes?.join(", ")}</Text>
          </div>
        </div>
      </dl>

      {/* Show an input to apply a discount */}
      <UpdateDiscountForm discountCodes={codes}>
        <div className="flex items-center gap-3">
          <input
            className="p-3 border border-line rounded-none !leading-tight grow"
            type="text"
            name="discountCode"
            placeholder="Discount code"
          />
          <Button variant="outline" className="!leading-tight">
            Apply
          </Button>
        </div>
      </UpdateDiscountForm>
    </>
  );
}

function UpdateDiscountForm({
  discountCodes,
  children,
}: {
  discountCodes?: string[];
  children: React.ReactNode;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{
        discountCodes: discountCodes || [],
      }}
    >
      {children}
    </CartForm>
  );
}

function CartLines({
  layout = "drawer",
  lines: cartLines,
}: {
  layout: Layouts;
  lines: CartLine[];
}) {
  let currentLines = cartLines;
  let scrollRef = useRef(null);
  let { y } = useScroll(scrollRef);

  return (
    <section
      ref={scrollRef}
      aria-labelledby="cart-contents"
      className={clsx([
        y > 0 ? "border-t border-line/50" : "",
        layout === "page" && "flex-grow md:translate-y-4 lg:col-span-2",
        layout === "drawer" && "px-5 pb-5 overflow-auto transition",
      ])}
    >
      <ul
        className={clsx(
          "grid",
          layout === "page" && "gap-9",
          layout === "drawer" && "gap-5",
        )}
      >
        {currentLines.map((line) => (
          <CartLineItem key={line.id} line={line} layout={layout} />
        ))}
      </ul>
    </section>
  );
}

function CartCheckoutActions({
  checkoutUrl,
  layout,
}: { checkoutUrl: string; layout: Layouts }) {
  if (!checkoutUrl) return null;

  return (
    <div className="flex flex-col gap-3">
      <a href={checkoutUrl} target="_self">
        <Button className="w-full">Continue to Checkout</Button>
      </a>
      {/* @todo: <CartShopPayButton cart={cart} /> */}
      {layout === "drawer" && (
        <Button variant="link" link="/cart" className="w-fit mx-auto">
          View cart
        </Button>
      )}
    </div>
  );
}

function CartSummary({
  cost,
  layout,
  children = null,
}: {
  children?: React.ReactNode;
  cost: CartApiQueryFragment["cost"];
  layout: Layouts;
}) {
  return (
    <section
      aria-labelledby="summary-heading"
      className={clsx(
        layout === "drawer" && "grid gap-4 p-5 border-t border-line/50",
        layout === "page" &&
          "sticky top-nav grid gap-6 p-4 md:px-6 md:translate-y-4 bg-background/5 rounded w-full",
      )}
    >
      <h2 id="summary-heading" className="sr-only">
        Order summary
      </h2>
      <dl className="grid">
        <div className="flex items-center justify-between font-medium">
          <dt>Subtotal</dt>
          <dd>
            {cost?.subtotalAmount?.amount ? (
              <Money data={cost?.subtotalAmount} />
            ) : (
              "-"
            )}
          </dd>
        </div>
      </dl>
      {children}
    </section>
  );
}

type OptimisticData = {
  action?: string;
  quantity?: number;
};

function CartLineItem({ line, layout }: { line: CartLine; layout: Layouts }) {
  let optimisticData = useOptimisticData<OptimisticData>(line?.id);

  if (!line?.id) return null;

  let { id, quantity, merchandise } = line;
  if (typeof quantity === "undefined" || !merchandise?.product) return null;

  return (
    <li
      key={id}
      className="flex gap-4"
      style={{
        // Hide the line item if the optimistic data action is remove
        // Do not remove the form from the DOM
        display: optimisticData?.action === "remove" ? "none" : "flex",
      }}
    >
      <div className="shrink-0">
        {merchandise.image && (
          <Image
            width={250}
            height={250}
            data={merchandise.image}
            className="object-cover object-center w-24 h-auto"
            alt={merchandise.title}
            aspectRatio={getImageAspectRatio(merchandise.image, "adapt")}
          />
        )}
      </div>
      <div className="flex flex-col justify-between grow">
        <div className="flex justify-between gap-4">
          <div className="space-y-2">
            <div>
              {merchandise?.product?.handle ? (
                <Link to={`/products/${merchandise.product.handle}`}>
                  <span className="underline-animation">
                    {merchandise?.product?.title || ""}
                  </span>
                </Link>
              ) : (
                <p>{merchandise?.product?.title || ""}</p>
              )}
            </div>
            <div className="text-sm space-y-0.5">
              {(merchandise?.selectedOptions || [])
                .filter((option) => option.value !== "Default Title")
                .map((option) => (
                  <div
                    key={option.name}
                    className="text-[var(--color-compare-price-text)]"
                  >
                    {option.name}: {option.value}
                  </div>
                ))}
            </div>
          </div>
          {layout === "drawer" && (
            <ItemRemoveButton lineId={id} className="-mt-1.5 -mr-2" />
          )}
        </div>
        <div
          className={clsx(
            "flex items-center gap-2",
            layout === "drawer" && "justify-between",
          )}
        >
          <CartLineQuantityAdjust line={line} />
          {layout === "page" && <ItemRemoveButton lineId={id} />}
          <CartLinePrice line={line} as="span" />
        </div>
      </div>
    </li>
  );
}

function ItemRemoveButton({
  lineId,
  className,
}: { lineId: CartLine["id"]; className?: string }) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{ lineIds: [lineId] }}
    >
      <button
        className={clsx(
          "flex items-center justify-center w-8 h-8 border-none",
          className,
        )}
        type="submit"
      >
        <span className="sr-only">Remove</span>
        <IconTrash aria-hidden="true" className="h-4 w-4" />
      </button>
      <OptimisticInput id={lineId} data={{ action: "remove" }} />
    </CartForm>
  );
}

function CartLineQuantityAdjust({ line }: { line: CartLine }) {
  let optimisticId = line?.id;
  let optimisticData = useOptimisticData<OptimisticData>(optimisticId);

  if (!line || typeof line?.quantity === "undefined") return null;

  let optimisticQuantity = optimisticData?.quantity || line.quantity;

  let { id: lineId, isOptimistic } = line;
  let prevQuantity = Number(Math.max(0, optimisticQuantity - 1).toFixed(0));
  let nextQuantity = Number((optimisticQuantity + 1).toFixed(0));

  return (
    <>
      <label htmlFor={`quantity-${lineId}`} className="sr-only">
        Quantity, {optimisticQuantity}
      </label>
      <div className="flex items-center border border-line/50">
        <UpdateCartButton lines={[{ id: lineId, quantity: prevQuantity }]}>
          <button
            type="submit"
            name="decrease-quantity"
            aria-label="Decrease quantity"
            className="w-9 h-9 transition disabled:text-body/50 disabled:cursor-not-allowed"
            value={prevQuantity}
            disabled={optimisticQuantity <= 1 || isOptimistic}
          >
            <span>&#8722;</span>
            <OptimisticInput
              id={optimisticId}
              data={{ quantity: prevQuantity }}
            />
          </button>
        </UpdateCartButton>

        <div className="px-2 text-center" data-test="item-quantity">
          {optimisticQuantity}
        </div>

        <UpdateCartButton lines={[{ id: lineId, quantity: nextQuantity }]}>
          <button
            type="submit"
            className="w-9 h-9 transition disabled:text-body/50 disabled:cursor-not-allowed"
            name="increase-quantity"
            value={nextQuantity}
            aria-label="Increase quantity"
            disabled={isOptimistic}
          >
            <span>&#43;</span>
            <OptimisticInput
              id={optimisticId}
              data={{ quantity: nextQuantity }}
            />
          </button>
        </UpdateCartButton>
      </div>
    </>
  );
}

function UpdateCartButton({
  children,
  lines,
}: {
  children: React.ReactNode;
  lines: CartLineUpdateInput[];
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{
        lines,
      }}
    >
      {children}
    </CartForm>
  );
}

function CartLinePrice({
  line,
  priceType = "regular",
  ...passthroughProps
}: {
  line: CartLine;
  priceType?: "regular" | "compareAt";
  [key: string]: any;
}) {
  if (!line?.cost?.amountPerQuantity || !line?.cost?.totalAmount) return null;

  let moneyV2 =
    priceType === "regular"
      ? line.cost.totalAmount
      : line.cost.compareAtAmountPerQuantity;

  if (moneyV2 == null) {
    return null;
  }

  return (
    <Money
      withoutTrailingZeros
      {...passthroughProps}
      data={moneyV2}
      className="text-sm ml-auto"
    />
  );
}

export function CartEmpty({
  hidden = false,
  layout = "drawer",
  onClose,
}: {
  hidden: boolean;
  layout?: Layouts;
  onClose?: () => void;
}) {
  let scrollRef = useRef(null);
  let { y } = useScroll(scrollRef);
  return (
    <div
      ref={scrollRef}
      className={clsx(
        layout === "drawer" && [
          "content-start space-y-12 px-5 pb-5 transition overflow-y-scroll h-screen-no-nav w-[400px]",
          y > 0 ? "border-t" : "",
        ],
        layout === "page" && [
          hidden ? "" : "grid",
          "pb-12 w-full md:items-start gap-4 md:gap-8 lg:gap-12",
        ],
      )}
      hidden={hidden}
    >
      <div className={clsx(layout === "page" && "text-center")}>
        <p className="mb-4">
          Looks like you haven&rsquo;t added anything yet, let&rsquo;s get you
          started!
        </p>
        <Button
          className={clsx(layout === "drawer" ? "w-full" : "min-w-48")}
          link={layout === "page" ? "/products" : ""}
          onClick={onClose}
        >
          Start Shopping
        </Button>
      </div>
      <div className="grid gap-4">
        <CartBestSellers
          count={4}
          heading="Shop Best Sellers"
          layout={layout}
          onClose={onClose}
          sortKey="BEST_SELLING"
        />
      </div>
    </div>
  );
}
