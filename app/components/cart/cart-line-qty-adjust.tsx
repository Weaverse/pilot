import { MinusIcon, PlusIcon } from "@phosphor-icons/react";
import {
  CartForm,
  type OptimisticCart,
  OptimisticInput,
  useOptimisticData,
} from "@shopify/hydrogen";
import type { CartLineUpdateInput } from "@shopify/hydrogen/storefront-api-types";
import type { CartApiQueryFragment } from "storefront-api.generated";
import type { CartLineOptimisticData } from "./cart-line-item";

export function CartLineQuantityAdjust({
  line,
}: {
  line: OptimisticCart<CartApiQueryFragment>["lines"]["nodes"][0];
}) {
  const optimisticId = line?.id;
  const optimisticData =
    useOptimisticData<CartLineOptimisticData>(optimisticId);

  if (!line || typeof line?.quantity === "undefined") {
    return null;
  }

  const optimisticQuantity = optimisticData?.quantity || line.quantity;

  const { id: lineId, isOptimistic } = line;
  const prevQuantity = Number(Math.max(0, optimisticQuantity - 1).toFixed(0));
  const nextQuantity = Number((optimisticQuantity + 1).toFixed(0));

  return (
    <>
      <label htmlFor={`quantity-${lineId}`} className="sr-only">
        Quantity, {optimisticQuantity}
      </label>
      <div className="flex items-center justify-evenly border border-line-subtle min-w-30">
        <UpdateCartButton lines={[{ id: lineId, quantity: prevQuantity }]}>
          <button
            type="submit"
            name="decrease-quantity"
            aria-label="Decrease quantity"
            className="size-9 transition disabled:cursor-not-allowed disabled:text-body-subtle inline-flex items-center justify-center"
            value={prevQuantity}
            disabled={optimisticQuantity <= 1 || isOptimistic}
          >
            {/* <span>&#8722;</span> */}
            <MinusIcon />
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
            className="size-9 transition disabled:cursor-not-allowed disabled:text-body-subtle inline-flex items-center justify-center"
            name="increase-quantity"
            value={nextQuantity}
            aria-label="Increase quantity"
            disabled={isOptimistic}
          >
            {/* <span>&#43;</span> */}
            <PlusIcon />
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
      inputs={{ lines }}
    >
      {children}
    </CartForm>
  );
}
