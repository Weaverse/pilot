import type { FetcherWithComponents } from "@remix-run/react";
import { useMatches } from "@remix-run/react";
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
import type { ShopifyPageViewPayload } from "@shopify/hydrogen";
import { useEffect } from "react";
import { useMemo } from "react";
import { Button } from "~/components/button";
import { openCartDrawer } from "~/components/layout/cart-drawer";
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
                "hover:text-[--btn-primary-text] hover:bg-[--btn-primary-bg]",
                className,
              )}
              disabled={disabled ?? fetcher.state !== "idle"}
              onClick={openCartDrawer}
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

function usePageAnalytics({ hasUserConsent }: { hasUserConsent: boolean }) {
  let matches = useMatches();

  return useMemo(() => {
    let data: Record<string, unknown> = {};
    for (let match of matches) {
      let eventData = match?.data as Record<string, unknown>;
      if (eventData) {
        eventData.analytics && Object.assign(data, eventData.analytics);
        let selectedLocale =
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
}): JSX.Element {
  let fetcherData = fetcher.data;
  let formData = fetcher.formData;
  let pageAnalytics = usePageAnalytics({ hasUserConsent: true });

  useEffect(() => {
    if (formData) {
      let cartData: Record<string, unknown> = {};
      let cartInputs = CartForm.getFormInput(formData);

      try {
        if (cartInputs.inputs.analytics) {
          let dataInForm: unknown = JSON.parse(
            String(cartInputs.inputs.analytics),
          );
          Object.assign(cartData, dataInForm);
        }
      } catch {
        // do nothing
      }

      if (Object.keys(cartData).length && fetcherData) {
        let addToCartPayload: ShopifyAddToCartPayload = {
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
