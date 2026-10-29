import clsx from "clsx";
import { useId } from "react";
import { Icon } from "~/components/icon";
import { Image } from "~/components/image";
import { Link } from "~/components/link";
import { Money } from "~/components/money";
import { RevealUnderline } from "~/components/reveal-underline";
import { Skeleton } from "~/components/skeleton";
import type { CartLayoutType } from "~/types/others";
import { lineDiscountTotal, toMoney } from "~/utils/cart";
import { calculateAspectRatio } from "~/utils/image";
import { CartLineQuantityAdjust } from "./cart-line-qty-adjust";
import { type CartLineData, useCart, useCartForm } from "./cart-store";

/**
 * A line the shopper just added has an `optimistic:` ID until Shopify confirms
 * it. It has no real line to update or remove yet, and no server price.
 */
export function isOptimisticLine(line: CartLineData) {
  return line.id.startsWith("optimistic:");
}

function isDefaultVariant(
  selectedOptions: { name: string; value: string }[] | undefined,
) {
  if (selectedOptions?.length !== 1) {
    return false;
  }
  const { name, value } = selectedOptions[0];
  return name === "Title" && value === "Default Title";
}

export function CartLineItem({
  line,
  childLines,
  layout,
  onClose,
}: {
  line: CartLineData;
  childLines?: CartLineData[];
  layout: CartLayoutType;
  onClose?: () => void;
}) {
  const errorId = useId();
  const isNew = isOptimisticLine(line);
  const isPending = useCart((state) => state.pending.lines.has(line.id));
  const lineError = useCart((state) => state.errors.lines.get(line.id));
  const errorMessage = lineError?.userErrors[0]?.message;
  const { quantity, merchandise } = line;

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
  const sellingPlanName = (
    line.sellingPlanAllocation?.sellingPlan as { name?: string } | undefined
  )?.name;

  return (
    <li className="flex gap-4">
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
          <div className="flex flex-col gap-1">
            {product.handle ? (
              <Link to={url} className="inline-block" onClick={onClose}>
                <RevealUnderline>{product.title || ""}</RevealUnderline>
              </Link>
            ) : (
              <h5 className="text-base">{product.title || ""}</h5>
            )}
            {!isDefaultVariant(selectedOptions) && (
              <div className="space-y-0.5 text-sm text-gray-500">{title}</div>
            )}
            {sellingPlanName && (
              <div className="text-sm text-gray-500">{sellingPlanName}</div>
            )}
            {childLines?.length ? (
              <ul
                className="space-y-0.5 text-sm text-gray-500"
                aria-label={`Items included with ${product.title}`}
              >
                {childLines.map((child) => (
                  <li key={child.id}>
                    {child.quantity} × {child.merchandise?.product.title}
                    {child.merchandise &&
                      !isDefaultVariant(child.merchandise.selectedOptions) &&
                      ` – ${child.merchandise.title}`}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          {layout === "drawer" && (
            <ItemRemoveButton
              lineId={line.id}
              className="-mt-1.5 -mr-2"
              disabled={isNew}
            />
          )}
        </div>
        <div
          className={clsx(
            "flex items-center gap-2",
            layout === "drawer" && "justify-between",
          )}
        >
          <CartLineQuantityAdjust
            line={line}
            disabled={isNew}
            isPending={isPending}
            errorId={errorMessage ? errorId : undefined}
          />
          {layout === "page" && (
            <ItemRemoveButton lineId={line.id} disabled={isNew} />
          )}
          <CartLinePrice line={line} isNew={isNew} isPending={isPending} />
        </div>
        {errorMessage && (
          <p id={errorId} role="alert" className="text-sm text-red-600">
            {errorMessage}
          </p>
        )}
      </div>
    </li>
  );
}

function ItemRemoveButton({
  lineId,
  className,
  disabled = false,
}: {
  lineId: string;
  className?: string;
  disabled?: boolean;
}) {
  const { formProps, register } = useCartForm();

  return (
    <form {...formProps()}>
      <input type="hidden" {...register("lineId", { value: lineId })} />
      <button
        className={clsx(
          "disabled:text-body-subtle flex h-8 w-8 items-center justify-center border-none disabled:cursor-not-allowed",
          className,
        )}
        type="submit"
        {...register("remove")}
        disabled={disabled}
      >
        <span className="sr-only">Remove</span>
        <Icon name="trash" aria-hidden="true" className="size-4.5" />
      </button>
    </form>
  );
}

function CartLinePrice({
  line,
  priceType = "regular",
  isNew,
  isPending,
}: {
  line: CartLineData;
  priceType?: "regular" | "compareAt";
  isNew?: boolean;
  isPending?: boolean;
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

  // A just-added line has no server price yet.
  if (isNew) {
    return <Skeleton as="span" className="ml-auto h-4 w-16 rounded-md" />;
  }

  // Item-level discount: when a line carries a LINE_ITEM allocation, cost.totalAmount
  // already reflects the reduced price, which on its own just looks like a cheaper
  // item. Show the pre-discount total struck through next to it so the saving is
  // explained at the product line, not only in the cart summary.
  const lineDiscount = priceType === "regular" ? lineDiscountTotal(line) : 0;
  if (lineDiscount > 0) {
    const original = toMoney(
      Number.parseFloat(line.cost.totalAmount.amount) + lineDiscount,
      line.cost.totalAmount.currencyCode,
    );
    return (
      <span
        className={clsx(
          "ml-auto flex flex-col items-end gap-0.5 leading-tight",
          isPending && "opacity-50",
        )}
      >
        <Money
          withoutTrailingZeros
          as="span"
          data={original}
          className="text-sm text-gray-500 line-through"
        />
        <Money withoutTrailingZeros as="span" data={line.cost.totalAmount} />
      </span>
    );
  }

  // The previous total stays visible, dimmed, until Shopify confirms the change.
  return (
    <Money
      withoutTrailingZeros
      as="span"
      data={moneyV2}
      className={clsx("ml-auto", isPending && "opacity-50")}
    />
  );
}
