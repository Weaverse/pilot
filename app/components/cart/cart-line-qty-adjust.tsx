import clsx from "clsx";
import { useId } from "react";
import { Icon } from "~/components/icon";
import { type CartLineData, useCartForm } from "./cart-store";

/**
 * The line's quantity form. The hidden `set` button comes first so editing the
 * quantity and pressing Enter (or leaving the field) sets it; the stepper
 * buttons increase and decrease. Without JavaScript the form posts to
 * `/api/cart`, which redirects back to the page.
 */
export function CartLineQuantityAdjust({
  line,
  disabled,
  isPending,
  errorId,
}: {
  line: CartLineData;
  disabled?: boolean;
  isPending?: boolean;
  errorId?: string;
}) {
  const { formProps, register } = useCartForm();
  // The drawer and the `/cart` page can render the same line at once.
  const inputId = useId();

  return (
    <form {...formProps()}>
      <button type="submit" {...register("set")} />
      <input type="hidden" {...register("lineId", { value: line.id })} />
      <label htmlFor={inputId} className="sr-only">
        Quantity, {line.quantity}
      </label>
      <div className="border-line-subtle flex min-w-30 items-center justify-evenly rounded-md border">
        <button
          type="submit"
          {...register("decrease")}
          aria-label="Decrease quantity"
          className="disabled:text-body-subtle inline-flex size-9 items-center justify-center transition disabled:cursor-not-allowed"
          disabled={line.quantity <= 1 || disabled}
        >
          <Icon name="minus" />
        </button>
        <input
          id={inputId}
          {...register("quantity", { value: line.quantity, interactive: true })}
          data-test="item-quantity"
          readOnly={disabled}
          aria-invalid={errorId ? true : undefined}
          aria-describedby={errorId}
          className={clsx(
            "w-12 border-none bg-transparent px-2 py-0 text-center focus:ring-0",
            isPending && "opacity-50",
          )}
        />
        <button
          type="submit"
          {...register("increase")}
          aria-label="Increase quantity"
          className="disabled:text-body-subtle inline-flex size-9 items-center justify-center transition disabled:cursor-not-allowed"
          disabled={disabled}
        >
          <Icon name="plus" />
        </button>
      </div>
    </form>
  );
}
