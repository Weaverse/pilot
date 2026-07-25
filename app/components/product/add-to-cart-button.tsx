import { CartForm, type OptimisticCartLineInput } from "@shopify/hydrogen";
import { useEffect, useRef } from "react";
import type { FetcherWithComponents } from "react-router";
import { Button, type ButtonProps } from "~/components/button";
import { useCartFetcherSync, useCartStore } from "~/components/cart/store";
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

type AddToCartButtonContentProps = Omit<AddToCartButtonProps, "lines"> & {
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
  children,
  disabled,
  className,
  ...props
}: AddToCartButtonContentProps) {
  const { open: openCartDrawer } = useCartStore();
  useCartFetcherSync(fetcher);
  const prevStateRef = useRef<"idle" | "submitting" | "loading">("idle");
  const isLoading = fetcher.state !== "idle";

  useEffect(() => {
    if (prevStateRef.current !== "idle" && fetcher.state === "idle") {
      openCartDrawer();
    }
    prevStateRef.current = fetcher.state;
  }, [fetcher.state, openCartDrawer]);

  return (
    <Button
      type="submit"
      className={cn("relative w-full", className)}
      disabled={disabled ?? isLoading}
      {...props}
    >
      <span className={cn(isLoading && "invisible")}>
        {children || "Add to cart"}
      </span>
      {isLoading && <Spinner className="z-0" size={20} duration={400} />}
    </Button>
  );
}
