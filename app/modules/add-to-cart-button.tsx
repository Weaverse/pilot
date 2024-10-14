import type { FetcherWithComponents } from "@remix-run/react";
import type {
  OptimisticCartLineInput,
  ShopifyAddToCartPayload,
} from "@shopify/hydrogen";
import {
  AnalyticsEventName,
  CartForm,
  getClientBrowserParameters,
  sendShopifyAnalytics,
} from "@shopify/hydrogen";
import { useEffect } from "react";
import Button from "~/components/button";
import { usePageAnalytics } from "~/hooks/use-page-analytics";

export function AddToCartButton({
  children,
  lines,
  className = "",
  variant = "primary",
  width = "full",
  disabled,
  analytics,
  ...props
}: {
  children: React.ReactNode;
  lines: OptimisticCartLineInput[];
  className?: string;
  variant?: "primary" | "secondary" | "outline" | "link";
  width?: "auto" | "full";
  disabled?: boolean;
  analytics?: unknown;
  [key: string]: any;
}) {
  return (
    <CartForm
      route="/cart"
      inputs={{ lines }}
      action={CartForm.ACTIONS.LinesAdd}
    >
      {(fetcher: FetcherWithComponents<any>) => {
        return (
          <AddToCartAnalytics fetcher={fetcher}>
            <input
              type="hidden"
              name="analytics"
              value={JSON.stringify(analytics)}
            />
            <Button
              type="submit"
              variant={variant}
              className={className}
              disabled={disabled ?? fetcher.state !== "idle"}
              {...props}
            >
              {children}
            </Button>
          </AddToCartAnalytics>
        );
      }}
    </CartForm>
  );
}

function AddToCartAnalytics({
  fetcher,
  children,
}: {
  fetcher: FetcherWithComponents<any>;
  children: React.ReactNode;
}): JSX.Element {
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
            String(cartInputs.inputs.analytics)
          );
          Object.assign(cartData, dataInForm);
        }
      } catch {
        // do nothing
      }

      if (Object.keys(cartData).length && fetcherData) {
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
