import {
  AnalyticsEvent,
  type CartUpdatePayload,
  type PageViewPayload,
  type ProductViewPayload,
  useAnalytics,
  useNonce,
} from "@shopify/hydrogen";
import { useEffect } from "react";
import { useRouteLoaderData } from "react-router";
import type { RootLoader } from "~/root";

export function CustomAnalytics() {
  let { subscribe } = useAnalytics();
  let nonce = useNonce();
  let rootData = useRouteLoaderData<RootLoader>("root");
  let id = rootData?.googleGtmID;

  useEffect(() => {
    subscribe(AnalyticsEvent.PAGE_VIEWED, (data: PageViewPayload) => {
      window.dataLayer?.push({
        event: "page_viewed",
        page_url: data.url,
      });
    });
    subscribe(AnalyticsEvent.PRODUCT_VIEWED, (data: ProductViewPayload) => {
      window.dataLayer?.push({
        event: "product_viewed",
        product_id: data.products?.[0]?.id,
        product_name: data.products?.[0]?.title,
        product_price: data.products?.[0]?.price,
        product_url: data.products?.[0]?.url,
      });
    });
    subscribe(AnalyticsEvent.CART_UPDATED, (data: CartUpdatePayload) => {
      window.dataLayer?.push({
        event: "cart_updated",
        cart_id: data.cart?.id,
        cart_total: data.cart?.cost?.totalAmount?.amount,
        cart_total_quantity: data.cart?.totalQuantity,
      });
    });
  }, [subscribe]);

  useEffect(() => {
    if (!id) return;
    let init = () => {
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) {
        window.dataLayer.push(args);
      }
      gtag("js", new Date());
      gtag({ "gtm.start": new Date().getTime(), event: "gtm.js" });
      gtag("config", id);

      let script = document.createElement("script");
      script.async = true;
      script.nonce = nonce;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${id}`;
      document.head.appendChild(script);
    };
    if ("requestIdleCallback" in window) {
      requestIdleCallback(init);
    } else {
      setTimeout(init, 1000);
    }
  }, [id, nonce]);

  return null;
}
