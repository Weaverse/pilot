import type {
  OptimisticCartLineInput,
  ShopifyAddToCartPayload,
  ShopifyPageViewPayload,
} from "@shopify/hydrogen";
import {
  AnalyticsEventName,
  CartForm,
  getClientBrowserParameters,
  sendShopifyAnalytics,
} from "@shopify/hydrogen";
import { useEffect, useRef, useState } from "react";
import type { FetcherWithComponents } from "react-router";
import { useMatches } from "react-router";
import { Button } from "~/components/button";
import { useCartFetcherSync } from "~/components/cart/cart-sync";
import { useCartStore } from "~/components/cart/store";
import { Spinner } from "~/components/spinner";
import { usePrefixPathWithLocale } from "~/hooks/use-prefix-path-with-locale";
import { cn } from "~/utils/cn";
import { DEFAULT_LOCALE } from "~/utils/const";

export function AddToCartButton({
  children,
  lines,
  className = "",
  disabled,
  analytics,
  ...props
}: {
  children: React.ReactNode;
  lines: OptimisticCartLineInput[];
  className?: string;
  disabled?: boolean;
  analytics?: unknown;
  [key: string]: any;
}) {
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
          analytics={analytics}
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
  analytics,
  ...props
}: {
  fetcher: FetcherWithComponents<any>;
  lines: OptimisticCartLineInput[];
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  analytics?: unknown;
  [key: string]: any;
}) {
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
    <AddToCartAnalytics fetcher={fetcher}>
      <input type="hidden" name="analytics" value={JSON.stringify(analytics)} />
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
    </AddToCartAnalytics>
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

function usePageAnalytics({ hasUserConsent }: { hasUserConsent: boolean }) {
  const matches = useMatches();

  const data: Record<string, unknown> = {};
  for (const match of matches) {
    const eventData = match?.data as Record<string, unknown>;
    if (eventData) {
      if (eventData.analytics) {
        Object.assign(data, eventData.analytics);
      }
      const selectedLocale =
        (eventData.selectedLocale as typeof DEFAULT_LOCALE) || DEFAULT_LOCALE;
      Object.assign(data, {
        currency: selectedLocale.currency,
        acceptedLanguage: selectedLocale.language,
      });
    }
  }

  return {
    ...data,
    hasUserConsent,
  } as unknown as ShopifyPageViewPayload;
}

function AddToCartAnalytics({
  fetcher,
  children,
}: {
  fetcher: FetcherWithComponents<any>;
  children: React.ReactNode;
}) {
  const fetcherData = fetcher.data;
  const formData = fetcher.formData;
  const pageAnalytics = usePageAnalytics({ hasUserConsent: true });

  useEffect(() => {
    if (formData) {
      const cartData: Record<string, unknown> = {};
      const cartInputs = CartForm.getFormInput(formData);

      try {
        if (cartInputs.inputs.analytics) {
          const dataInForm: unknown = JSON.parse(
            String(cartInputs.inputs.analytics),
          );
          Object.assign(cartData, dataInForm);
        }
      } catch {
        // do nothing
      }

      // A failed add settles with no `cart` on the response — reading
      // `fetcherData.cart.id` unguarded would throw, and there is nothing
      // meaningful to report anyway.
      if (Object.keys(cartData).length && fetcherData?.cart?.id) {
        const addToCartPayload: ShopifyAddToCartPayload = {
          ...getClientBrowserParameters(),
          ...pageAnalytics,
          ...cartData,
          cartId: fetcherData.cart.id,
        };

        sendShopifyAnalytics({
          eventName: AnalyticsEventName.ADD_TO_CART,
          payload: addToCartPayload,
        });
      }
    }
  }, [fetcherData, formData, pageAnalytics]);

  return <>{children}</>;
}
