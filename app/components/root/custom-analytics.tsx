/** biome-ignore-all lint/suspicious/noConsole: use console.log for debugging */
import {
  AnalyticsEvent,
  type CartUpdatePayload,
  type PageViewPayload,
  type ProductViewPayload,
  Script,
  useAnalytics,
  useNonce,
} from "@shopify/hydrogen";
import { useEffect } from "react";
import { useRouteLoaderData } from "react-router";
import type { RootLoader } from "~/root";

export function CustomAnalytics() {
  const { subscribe, canTrack } = useAnalytics();
  const nonce = useNonce();
  const rootData = useRouteLoaderData<RootLoader>("root");

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation> --- IGNORE ---
  useEffect(() => {
    setTimeout(() => {
      const isTrackingAllowed = canTrack();
      console.log("CustomAnalytics - isTrackingAllowed", isTrackingAllowed);
    }, 1000);
    let dataToSentToGTM: any = {};
    // Standard events
    subscribe(AnalyticsEvent.PAGE_VIEWED, (data: PageViewPayload) => {
      console.log("CustomAnalytics - Page viewed:", data);
      dataToSentToGTM = {
        event: "page_viewed",
        page_url: data.url,
      };
      window.dataLayer?.push(dataToSentToGTM);
    });
    subscribe(AnalyticsEvent.PRODUCT_VIEWED, (data: ProductViewPayload) => {
      console.log("CustomAnalytics - Product viewed:", data);
      dataToSentToGTM = {
        event: "product_viewed",
        product_id: data.products?.[0]?.id,
        product_name: data.products?.[0]?.title,
        product_price: data.products?.[0]?.price,
        product_url: data.products?.[0]?.url,
      };
      window.dataLayer?.push(dataToSentToGTM);
    });
    subscribe(AnalyticsEvent.COLLECTION_VIEWED, (data) => {
      console.log("CustomAnalytics - Collection viewed:", data);
    });
    subscribe(AnalyticsEvent.CART_VIEWED, (data) => {
      console.log("CustomAnalytics - Cart viewed:", data);
    });
    subscribe(AnalyticsEvent.CART_UPDATED, (data: CartUpdatePayload) => {
      console.log("CustomAnalytics - Cart updated:", data);
      dataToSentToGTM = {
        event: "cart_updated",
        cart_id: data.cart?.id,
        cart_total: data.cart?.cost?.totalAmount?.amount,
        cart_total_quantity: data.cart?.totalQuantity,
      };
      window.dataLayer?.push(dataToSentToGTM);
    });
    subscribe(AnalyticsEvent.PRODUCT_ADD_TO_CART, (data) => {
      console.log("CustomAnalytics - Product added to cart:", data);
    });
    subscribe(AnalyticsEvent.PRODUCT_REMOVED_FROM_CART, (data) => {
      console.log("CustomAnalytics - Product removed from cart:", data);
    });
    subscribe(AnalyticsEvent.SEARCH_VIEWED, (data) => {
      console.log("CustomAnalytics - Search viewed:", data);
    });

    // Custom events
    subscribe(AnalyticsEvent.CUSTOM_EVENT, (data) => {
      console.log("CustomAnalytics - CUSTOM_EVENT:", data);
    });
  }, []);

  const id = rootData?.googleGtmID;
  if (!id) {
    return null;
  }

  return (
    <>
      {/* Initialize GTM container */}
      <script
        nonce={nonce}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: `
              dataLayer = window.dataLayer || [];

              function gtag(){
                dataLayer.push(arguments)
              };

              gtag('js', new Date());
              gtag({'gtm.start': new Date().getTime(),event:'gtm.js'})
              gtag('config', "${id}");
          `,
        }}
      />

      {/* Load GTM script */}
      <Script async src={`https://www.googletagmanager.com/gtm.js?id=${id}`} />
    </>
  );
}
