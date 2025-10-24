import { Money } from "@shopify/hydrogen";
import clsx from "clsx";
import type { CartApiQueryFragment } from "storefront-api.generated";
import { Button } from "~/components/button";
import { Link } from "~/components/link";
import { Skeleton } from "~/components/skeleton";
import type { CartLayoutType } from "~/types/others";

export function CartSummary({
  cost,
  layout,
  children = null,
  isOptimistic,
}: {
  children?: React.ReactNode;
  cost: CartApiQueryFragment["cost"];
  layout: CartLayoutType;
  isOptimistic?: boolean;
}) {
  return (
    <div
      className={clsx(
        layout === "drawer" && "grid gap-4 border-line-subtle border-t pt-4",
        layout === "page" &&
          "sticky top-(--height-nav) grid w-full gap-6 rounded-sm p-4 md:translate-y-4 md:px-6",
      )}
    >
      <h2 id="summary-heading" className="sr-only">
        Order summary
      </h2>
      <dl className="grid">
        <div className="flex items-center justify-between font-medium text-lg">
          <dt>Subtotal</dt>
          {isOptimistic ? (
            <Skeleton className="h-4 w-20 rounded" />
          ) : (
            <dd>
              {cost?.subtotalAmount?.amount ? (
                <Money data={cost?.subtotalAmount} />
              ) : (
                "-"
              )}
            </dd>
          )}
        </div>
      </dl>
      {children}
    </div>
  );
}

export function CartCheckoutActions({
  checkoutUrl,
  layout,
}: {
  checkoutUrl: string;
  layout: CartLayoutType;
}) {
  if (!checkoutUrl) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      <a href={checkoutUrl} target="_self">
        <Button className="w-full">Continue to Checkout</Button>
      </a>
      {/* @todo: <CartShopPayButton cart={cart} /> */}
      {layout === "drawer" && (
        <Link variant="underline" to="/cart" className="mx-auto w-fit">
          View cart
        </Link>
      )}
    </div>
  );
}
