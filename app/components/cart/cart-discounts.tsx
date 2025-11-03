import { TrashIcon } from "@phosphor-icons/react";
import { CartForm } from "@shopify/hydrogen";
import type { Cart as CartType } from "@shopify/hydrogen/storefront-api-types";
import { useFetcher } from "react-router";
import { Button } from "~/components/button";

/**
 * Temporary discount UI
 * @param discountCodes the current discount codes applied to the cart
 * @todo rework when a design is ready
 */
export function CartDiscounts({
  discountCodes,
}: {
  discountCodes: CartType["discountCodes"];
}) {
  const codes: string[] =
    discountCodes
      ?.filter((discount) => discount.applicable)
      ?.map(({ code }) => code) || [];

  return (
    <>
      {/* Have existing discount, display it with a remove option */}
      <dl className={codes && codes.length !== 0 ? "grid" : "hidden"}>
        <div className="flex items-center justify-between font-medium">
          <dt>Discount(s)</dt>
          <div className="flex items-center justify-between">
            <UpdateDiscountForm>
              <button type="submit">
                <TrashIcon
                  aria-hidden="true"
                  className="mr-1 h-[18px] w-[18px]"
                />
              </button>
            </UpdateDiscountForm>
            <dd>{codes?.join(", ")}</dd>
          </div>
        </div>
      </dl>

      {/* Show an input to apply a discount */}
      <UpdateDiscountForm discountCodes={codes} />
    </>
  );
}

export function UpdateDiscountForm({
  discountCodes,
  children,
}: {
  discountCodes?: string[];
  children?: React.ReactNode;
}) {
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

  // If children are provided, render the remove discount button
  if (children) {
    return (
      <CartForm
        route="/cart"
        action={CartForm.ACTIONS.DiscountCodesUpdate}
        inputs={{ discountCodes: discountCodes || [] }}
      >
        {children}
      </CartForm>
    );
  }

  // Otherwise, render the apply discount form with fetcher
  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center gap-3">
        <input
          className="grow rounded-none border border-line p-3 leading-tight!"
          type="text"
          name="discountCode"
          placeholder="Discount code"
          required
        />
        <Button
          type="submit"
          variant="outline"
          className="leading-tight!"
          loading={fetcher.state !== "idle"}
          disabled={fetcher.state !== "idle"}
        >
          Apply
        </Button>
      </div>
    </form>
  );
}
