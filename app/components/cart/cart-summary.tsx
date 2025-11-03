import { TagIcon, XIcon } from "@phosphor-icons/react";
import { CartForm, Money, type OptimisticCart } from "@shopify/hydrogen";
import clsx from "clsx";
import { useState } from "react";
import { useFetcher } from "react-router";
import type { CartApiQueryFragment } from "storefront-api.generated";
import { Button } from "~/components/button";
import { Link } from "~/components/link";
import { Skeleton } from "~/components/skeleton";
import type { CartLayoutType } from "~/types/others";

export function CartSummary({
  cart,
  layout,
}: {
  cart: OptimisticCart<CartApiQueryFragment>;
  layout: CartLayoutType;
}) {
  const { cost, discountCodes, isOptimistic, checkoutUrl } = cart;
  return (
    <div
      className={clsx(
        layout === "drawer" && "grid border-line-subtle border-t pt-4",
        layout === "page" &&
          "sticky top-(--height-nav) grid w-full rounded-sm p-4 md:translate-y-4 md:px-6",
      )}
    >
      <h2 id="summary-heading" className="sr-only">
        Order summary
      </h2>
      {/* Render the cart discount codes here */}
      {discountCodes && discountCodes.length > 0 && (
        <div className="flex flex-wrap justify-end gap-2">
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
                  className="flex items-center justify-center gap-2 bg-line-subtle px-2 py-1.5 rounded-md [&>form]:flex"
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
      <dl className="grid my-4">
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
      <CartSummaryActions discountCodes={discountCodes} />
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

function CartSummaryActions({
  discountCodes,
}: {
  discountCodes: CartApiQueryFragment["discountCodes"];
}) {
  const [activeForm, setActiveForm] = useState<"note" | "discount" | null>(
    null,
  );
  const fetcher = useFetcher();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const discountCode = formData.get("discountCode") as string;
    const updatedCodes = discountCode
      ? [...(discountCodes || []), discountCode]
      : discountCodes || [];

    fetcher.submit(
      {
        [CartForm.INPUT_NAME]: JSON.stringify({
          action: CartForm.ACTIONS.DiscountCodesUpdate,
          inputs: { discountCodes: updatedCodes },
        }),
      },
      { method: "POST", action: "/cart" },
    );

    // Reset the input field after submission
    event.currentTarget.reset();
  }

  return (
    <div className="flex flex-col items-end gap-3">
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="underline"
          onClick={() => {
            setActiveForm(activeForm === "note" ? null : "note");
          }}
        >
          Add a note
        </Button>
        <span>/</span>
        <Button
          variant="underline"
          onClick={() => {
            setActiveForm(activeForm === "discount" ? null : "discount");
          }}
        >
          Apply a discount
        </Button>
      </div>

      {/* Note form */}
      {activeForm === "note" && (
        <div className="w-full border border-line-subtle p-4 space-y-2 shadow">
          <div className="font-medium text-lg">Add a note</div>
          <form className="space-y-2">
            <textarea
              className="w-full rounded-sm border border-line p-3 min-h-20 resize-none"
              placeholder="Add any special instructions or notes for your order..."
              rows={4}
            />
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="custom"
                onClick={() => {
                  setActiveForm(null);
                }}
                className="w-24 border-none"
              >
                Cancel
              </Button>
              <Button type="submit" variant="outline" className="leading-tight! w-24">
                Save Note
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Discount form */}
      {activeForm === "discount" && (
        <div className="w-full border border-line-subtle p-4 space-y-2 shadow">
          <div className="font-medium text-lg">Apply a discount code</div>
          {/* <CartDiscounts discountCodes={discountCodes} /> */}
          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              className="rounded-none border border-line p-3 leading-tight! w-full"
              type="text"
              name="discountCode"
              placeholder="Discount code"
              required
            />
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="custom"
                onClick={() => {
                  setActiveForm(null);
                }}
                className="w-24 border-none"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="outline"
                className="leading-tight! w-24"
                loading={fetcher.state !== "idle"}
                disabled={fetcher.state !== "idle"}
              >
                Apply
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
