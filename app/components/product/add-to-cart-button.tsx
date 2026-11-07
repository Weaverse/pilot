import { canAddToCart, type ProductFormErrors } from "@shopify/hydrogen";
import { useState } from "react";
import { Button, type ButtonProps } from "~/components/button";
import { openCartDrawer } from "~/components/cart/cart-drawer";
import {
  type ProductFormData,
  useProductForm,
} from "~/components/product/product-form";
import { Spinner } from "~/components/spinner";
import { cn } from "~/utils/cn";

type AddToCartButtonProps = Omit<
  ButtonProps,
  "children" | "loading" | "type" | "name"
> & {
  children: React.ReactNode;
  /** The product of the surrounding `ProductProvider`. */
  product: ProductFormData;
  quantity?: number;
};

/**
 * Adds the selected variant of the surrounding `ProductProvider` to the cart.
 *
 * The form posts to the cart endpoint, so it works before hydration; once
 * hydrated, the product form hands the submission to the cart store, which
 * shows the line optimistically while the request runs.
 */
export function AddToCartButton({
  children,
  product,
  quantity = 1,
  className,
  disabled,
  ...props
}: AddToCartButtonProps) {
  const { options, register, formProps, pending, errors } = useProductForm();
  const [addError, setAddError] = useState<string | null>(null);
  const [wasPending, setWasPending] = useState(false);

  // `pending` belongs to this button's form: it turns on in the submit
  // handler (so the spinner shows in the frame the drawer opens) and off once
  // the store has applied the server's response, errors included. This add's
  // outcome is read at that moment only, so later cart changes made elsewhere
  // (the drawer, another form) never surface under this button.
  if (pending !== wasPending) {
    setWasPending(pending);
    setAddError(pending ? null : getAddErrorMessage(errors));
  }

  return (
    <form
      {...formProps({
        beforeSubmit: () => {
          // Open on submit, not after the response: the cart store already
          // holds the optimistic line, so the drawer's first paint shows it.
          openCartDrawer();
        },
      })}
    >
      <input type="hidden" {...register("merchandiseId", {})} />
      <input type="hidden" {...register("quantity", { value: quantity })} />
      <Button
        {...register("addToCart", {})}
        className={cn("relative w-full", className)}
        {...props}
        disabled={disabled || pending || !canAddToCart(product, options)}
        aria-busy={pending || undefined}
      >
        <span className={cn(pending && "invisible")}>
          {children || "Add to cart"}
        </span>
        {pending && <Spinner className="z-0" size={20} duration={400} />}
      </Button>
      {addError && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {addError}
        </p>
      )}
    </form>
  );
}

const ADD_FAILED_MESSAGE = "Couldn't add this to your cart. Please try again.";

/**
 * An add can fail two ways: Shopify `userErrors` (cart-level, or on the line
 * that holds the variant), or a failed request recorded as a network error.
 */
function getAddErrorMessage(errors: ProductFormErrors): string | null {
  const firstError = errors.userErrors[0] ?? errors.networkErrors[0];
  if (!firstError) {
    return null;
  }
  return firstError.message || ADD_FAILED_MESSAGE;
}
