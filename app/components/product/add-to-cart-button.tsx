import { CartForm, type OptimisticCartLineInput } from "@shopify/hydrogen";
import { useEffect, useRef, useState } from "react";
import type { FetcherWithComponents } from "react-router";
import { Button, type ButtonProps } from "~/components/button";
import { useCartFetcherSync } from "~/components/cart/cart-sync";
import { useCartStore } from "~/components/cart/store";
import { Spinner } from "~/components/spinner";
import { usePrefixPathWithLocale } from "~/hooks/use-prefix-path-with-locale";
import { cn } from "~/utils/cn";

type AddToCartButtonProps = Omit<
  ButtonProps,
  "children" | "loading" | "type"
> & {
  children: React.ReactNode;
  lines: OptimisticCartLineInput[];
};

type AddToCartButtonContentProps = AddToCartButtonProps & {
  fetcher: FetcherWithComponents<any>;
};

export function AddToCartButton({
  children,
  lines,
  className = "",
  disabled,
  ...props
}: AddToCartButtonProps) {
  const cartRoute = usePrefixPathWithLocale("/cart");

  return (
    <CartForm
      route={cartRoute}
      inputs={{ lines }}
      action={CartForm.ACTIONS.LinesAdd}
    >
      {(fetcher: FetcherWithComponents<any>) => (
        <AddToCartButtonContent
          fetcher={fetcher}
          lines={lines}
          disabled={disabled}
          className={className}
          {...props}
        >
          {children}
        </AddToCartButtonContent>
      )}
    </CartForm>
  );
}

function AddToCartButtonContent({
  fetcher,
  lines,
  children,
  disabled,
  className,
  ...props
}: AddToCartButtonContentProps) {
  const {
    open: openCartDrawer,
    stagePendingAdd,
    clearPendingAdd,
    setLastAddError,
  } = useCartStore();
  useCartFetcherSync(fetcher);
  const isLoading = fetcher.state !== "idle";
  // Token of the stage this button owns, so a concurrent add from another
  // button is never cleared by this one.
  const pendingTokenRef = useRef<string | null>(null);
  const submittedRef = useRef(false);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    if (fetcher.state !== "idle" || !submittedRef.current) {
      return;
    }
    submittedRef.current = false;
    const token = pendingTokenRef.current;
    pendingTokenRef.current = null;

    const message = getAddErrorMessage(fetcher.data);
    if (token) {
      clearPendingAdd(token);
    }
    setAddError(message);
    setLastAddError(message);
  }, [fetcher.state, fetcher.data, clearPendingAdd, setLastAddError]);

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    props.onClick?.(event);
    if (event.defaultPrevented) {
      return;
    }
    setAddError(null);
    submittedRef.current = true;
    // Stage BEFORE the form submits so the drawer's first paint already has
    // the line — the fetcher only becomes visible on the next render.
    pendingTokenRef.current = stagePendingAdd(lines);
    openCartDrawer();
  }

  return (
    <>
      <Button
        type="submit"
        className={cn("relative w-full", className)}
        {...props}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        onClick={handleClick}
      >
        <span className={cn(isLoading && "invisible")}>
          {children || "Add to cart"}
        </span>
        {isLoading && <Spinner className="z-0" size={20} duration={400} />}
      </Button>
      {addError && (
        <p role="alert" className="mt-2 text-red-600 text-sm">
          {addError}
        </p>
      )}
    </>
  );
}

const ADD_FAILED_MESSAGE = "Couldn't add this to your cart. Please try again.";

/**
 * A cart mutation can fail three ways: a thrown/network error surfaced as
 * `errors`, Shopify `userErrors`, or a response with no cart at all.
 */
function getAddErrorMessage(data: unknown): string | null {
  if (!data) {
    return null;
  }
  const payload = data as {
    cart?: unknown;
    errors?: { message?: string }[];
    userErrors?: { message?: string }[];
  };
  const firstError = payload.errors?.[0] ?? payload.userErrors?.[0];
  if (firstError) {
    return firstError.message || ADD_FAILED_MESSAGE;
  }
  if (!payload.cart) {
    return ADD_FAILED_MESSAGE;
  }
  return null;
}
