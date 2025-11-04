import { TagIcon, XIcon } from "@phosphor-icons/react";
import { CartForm, Money, type OptimisticCart } from "@shopify/hydrogen";
import clsx from "clsx";
import type { CartApiQueryFragment } from "storefront-api.generated";
import { Button } from "~/components/button";
import { Link } from "~/components/link";
import { Skeleton } from "~/components/skeleton";
import type { CartLayoutType } from "~/types/others";
import { CartSummaryActions } from "./cart-summary-actions";

export function CartSummary({
  cart,
  layout,
}: {
  cart: OptimisticCart<CartApiQueryFragment>;
  layout: CartLayoutType;
}) {
  const { cost, discountCodes, isOptimistic, checkoutUrl, attributes } = cart;
  const cartNote = attributes?.find((attr) => attr.key === "note")?.value;
  return (
    <div
      className={clsx(
        layout === "drawer" && "grid border-line-subtle border-t pt-4",
        layout === "page" &&
          "sticky top-(--height-nav) grid w-full rounded-sm py-4 lg:py-0 md:translate-y-4 md:px-6",
      )}
    >
      <h2 id="summary-heading" className="sr-only">
        Order summary
      </h2>
      {discountCodes && discountCodes.length > 0 && (
        <div className="flex flex-wrap justify-end gap-2 mb-4">
          {discountCodes
            .filter((discount) => discount.applicable)
            .map((discount) => {
              const codes = discountCodes
                .filter((d) => d.applicable)
                .map((d) => d.code);
              const updatedCodes = codes.filter((c) => c !== discount.code);

              return (
                <div
                  key={discount.code}
                  className="flex items-center justify-center gap-2 bg-gray-200 px-2 py-1.5 rounded-md [&>form]:flex"
                >
                  <TagIcon className="h-4 w-4" aria-hidden="true" />
                  <span className="leading-normal">{discount.code}</span>
                  <CartForm
                    route="/cart"
                    action={CartForm.ACTIONS.DiscountCodesUpdate}
                    inputs={{ discountCodes: updatedCodes || [] }}
                  >
                    <button
                      type="submit"
                      className="ml-1 transition-colors hover:text-red-600"
                      aria-label={`Remove discount code ${discount.code}`}
                    >
                      <XIcon
                        className="h-4 w-4"
                        weight="regular"
                        aria-hidden="true"
                      />
                    </button>
                  </CartForm>
                </div>
              );
            })}
        </div>
      )}
      <dl className="grid mb-4">
        <div
          className={clsx(
            "flex items-center justify-between font-medium",
            layout === "page" && "text-xl",
          )}
        >
          <dt>Estimated total:</dt>
          {isOptimistic ? (
            <Skeleton className="h-4 w-20 rounded" />
          ) : (
            <dd>
              {cost?.totalAmount?.amount ? (
                <Money data={cost?.totalAmount} />
              ) : (
                "-"
              )}
            </dd>
          )}
        </div>
      </dl>
      <div className="text-body-subtle text-right mb-2">
        Taxes, discounts and{" "}
        <Link
          target="_blank"
          to="/policies/shipping-policy"
          variant="underline"
          className="text-current after:bg-current"
        >
          shipping
        </Link>{" "}
        calculated at checkout.
      </div>
      <CartSummaryActions discountCodes={discountCodes} cartNote={cartNote} />
      {checkoutUrl && (
        <div className="flex flex-col gap-3 mt-8">
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
      )}
    </div>
  );
}
