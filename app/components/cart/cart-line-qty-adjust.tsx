import {
  CartForm,
  type OptimisticCart,
  OptimisticInput,
  useOptimisticData,
} from "@shopify/hydrogen";
import type { CartLineUpdateInput } from "@shopify/hydrogen/storefront-api-types";
import type { FetcherWithComponents } from "react-router";
import type { CartApiQueryFragment } from "storefront-api.generated";
import { Icon } from "~/components/icon";
import { usePrefixPathWithLocale } from "~/hooks/use-prefix-path-with-locale";
import type { CartLineOptimisticData } from "./cart-line-item";
import { useCartFetcherSync } from "./store";

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
      <div className="flex min-w-30 items-center justify-evenly border border-line-subtle rounded-md">
        <UpdateCartButton lines={[{ id: lineId, quantity: prevQuantity }]}>
          <button
            type="submit"
            name="decrease-quantity"
            aria-label="Decrease quantity"
            className="inline-flex size-9 items-center justify-center transition disabled:cursor-not-allowed disabled:text-body-subtle"
            value={prevQuantity}
            disabled={optimisticQuantity <= 1 || isOptimistic}
          >
            <Icon name="minus" />
            <OptimisticInput
              id={optimisticId}
              data={{ quantity: prevQuantity }}
            />
          </button>
        </UpdateCartButton>

        <div className="min-w-8 px-2 text-center" data-test="item-quantity">
          {optimisticQuantity}
        </div>

        <UpdateCartButton lines={[{ id: lineId, quantity: nextQuantity }]}>
          <button
            type="submit"
            className="inline-flex size-9 items-center justify-center transition disabled:cursor-not-allowed disabled:text-body-subtle"
            name="increase-quantity"
            value={nextQuantity}
            aria-label="Increase quantity"
            disabled={isOptimistic}
          >
            <Icon name="plus" />
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
  const cartRoute = usePrefixPathWithLocale("/cart");

  return (
    <CartForm
      route={cartRoute}
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{ lines }}
    >
      {(fetcher: FetcherWithComponents<any>) => (
        <UpdateCartButtonInner fetcher={fetcher}>
          {children}
        </UpdateCartButtonInner>
      )}
    </CartForm>
  );
}

function UpdateCartButtonInner({
  fetcher,
  children,
}: {
  fetcher: FetcherWithComponents<any>;
  children: React.ReactNode;
}) {
  useCartFetcherSync(fetcher);
  return <>{children}</>;
}
