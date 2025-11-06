import { TrashIcon } from "@phosphor-icons/react";
import {
  CartForm,
  Money,
  type OptimisticCart,
  OptimisticInput,
  useOptimisticData,
} from "@shopify/hydrogen";
import clsx from "clsx";
import type { CartApiQueryFragment } from "storefront-api.generated";
import { Image } from "~/components/image";
import { Link } from "~/components/link";
import { RevealUnderline } from "~/components/reveal-underline";
import { Skeleton } from "~/components/skeleton";
import type { CartLayoutType } from "~/types/others";
import { calculateAspectRatio } from "~/utils/image";
import { CartLineQuantityAdjust } from "./cart-line-qty-adjust";
import { useCartDrawerStore } from "./store";

type CartLine = OptimisticCart<CartApiQueryFragment>["lines"]["nodes"][0];

export type CartLineOptimisticData = {
  action?: string;
  quantity?: number;
};

export function CartLineItem({
  line,
  layout,
}: {
  line: CartLine;
  layout: CartLayoutType;
}) {
  const { close: closeCartDrawer } = useCartDrawerStore();
  const optimisticData = useOptimisticData<CartLineOptimisticData>(line?.id);

  if (!line?.id) {
    return null;
  }

  const { id, quantity, merchandise, isOptimistic: lineOptimistic } = line;
  /**
   * Determines if the current line item is in an optimistic state.
   * Note: The isOptimistic field on the line does not update as documented
   * in https://shopify.dev/docs/api/hydrogen/latest/hooks/useoptimisticcart#useOptimisticCart-returns,
   * so we manually check it via the optimisticData object when lineOptimistic is undefined.
   */
  const isOptimistic =
    lineOptimistic === undefined
      ? JSON.stringify(optimisticData) !== "{}"
      : lineOptimistic;

  if (typeof quantity === "undefined" || !merchandise?.product) {
    return null;
  }

  const { image, title, product, selectedOptions } = merchandise;
  let url = `/products/${product.handle}`;
  if (selectedOptions?.length) {
    const params = new URLSearchParams();
    for (const option of selectedOptions) {
      params.append(option.name, option.value);
    }
    url += `?${params.toString()}`;
  }
  let isDefaultVariant = false;
  if (selectedOptions?.length === 1) {
    const { name, value } = selectedOptions[0];
    isDefaultVariant = name === "Title" && value === "Default Title";
  }

  return (
    <li
      className="flex gap-4"
      style={{
        // Hide the line item if the optimistic data action is remove
        // Do not remove the form from the DOM
        display: optimisticData?.action === "remove" ? "none" : "flex",
      }}
    >
      <div className="relative shrink-0">
        {image && (
          <Image
            width={250}
            height={250}
            data={image}
            className="h-auto w-24"
            alt={title}
            aspectRatio={calculateAspectRatio(image, "adapt")}
          />
        )}
      </div>
      <div className="flex grow flex-col gap-3">
        <div className="flex justify-between gap-4">
          <div>
            <div>
              {product?.handle ? (
                <Link
                  to={url}
                  className="inline-block"
                  onClick={closeCartDrawer}
                >
                  <RevealUnderline>{product?.title || ""}</RevealUnderline>
                </Link>
              ) : (
                <p>{product?.title || ""}</p>
              )}
            </div>
            {!isDefaultVariant && (
              <div className="space-y-0.5 text-gray-500 text-sm">{title}</div>
            )}
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
          <CartLinePrice line={line} isOptimistic={isOptimistic} />
        </div>
      </div>
    </li>
  );
}

function ItemRemoveButton({
  lineId,
  className,
}: {
  lineId: CartLine["id"];
  className?: string;
}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{ lineIds: [lineId] }}
    >
      <button
        className={clsx(
          "flex h-8 w-8 items-center justify-center border-none",
          className,
        )}
        type="submit"
      >
        <span className="sr-only">Remove</span>
        <TrashIcon aria-hidden="true" className="size-4.5" />
      </button>
      <OptimisticInput id={lineId} data={{ action: "remove" }} />
    </CartForm>
  );
}

function CartLinePrice({
  line,
  priceType = "regular",
  isOptimistic,
}: {
  line: CartLine;
  priceType?: "regular" | "compareAt";
  isOptimistic?: boolean;
}) {
  if (!(line?.cost?.amountPerQuantity && line?.cost?.totalAmount)) {
    return null;
  }

  const moneyV2 =
    priceType === "regular"
      ? line.cost.totalAmount
      : line.cost.compareAtAmountPerQuantity;

  if (moneyV2 == null) {
    return null;
  }

  if (isOptimistic) {
    return <Skeleton as="span" className="ml-auto h-4 w-16 rounded" />;
  }
  return (
    <Money withoutTrailingZeros as="span" data={moneyV2} className="ml-auto" />
  );
}
