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
import { useEffect, useMemo } from "react";
import type { FetcherWithComponents } from "react-router";
import { useMatches } from "react-router";
import { Button } from "~/components/button";
import { toggleCartDrawer } from "~/components/layout/cart-drawer";
import { cn } from "~/utils/cn";
import { DEFAULT_LOCALE } from "~/utils/const";

export function AddToCartButton({
  children,
  lines,
  className = "",
  width = "full",
  disabled,
  analytics,
  ...props
}: {
  children: React.ReactNode;
  lines: OptimisticCartLineInput[];
  className?: string;
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
              className={cn(
                "hover:bg-(--btn-primary-bg) hover:text-(--btn-primary-text)",
                className,
              )}
              disabled={disabled ?? fetcher.state !== "idle"}
              onClick={() => toggleCartDrawer(true)}
              {...props}
            >
              {children || "Add to cart"}
            </Button>
          </AddToCartAnalytics>
        );
      }}
    </CartForm>
  );
}

function usePageAnalytics({ hasUserConsent }: { hasUserConsent: boolean }) {
  const matches = useMatches();

  return useMemo(() => {
    const data: Record<string, unknown> = {};
    for (const match of matches) {
      const eventData = match?.data as Record<string, unknown>;
      if (eventData) {
        eventData.analytics && Object.assign(data, eventData.analytics);
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
  }, [matches, hasUserConsent]);
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
