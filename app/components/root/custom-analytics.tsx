import { AnalyticsEvent, type AnalyticsCart } from "@shopify/hydrogen";
import { useEffect } from "react";
import { useRouteLoaderData } from "react-router";
import type { RootLoader } from "~/root";
import { useNonce } from "~/utils/csp";

let gtmDestinationAdded = false;

/**
 * Forwards analytics bus events to GTM's `dataLayer`, with the same pushes
 * classic Hydrogen's `useAnalytics().subscribe` produced.
 *
 * Registered once per page lifetime: re-adding a destination replays the
 * bus's retained events, which would push duplicates. Delivery (live and
 * replayed) is gated by Shopify Customer Privacy consent.
 */
function addGtmDestination() {
  const bus = window.Shopify?.analytics;
  if (gtmDestinationAdded || !bus) {
    return;
  }
  gtmDestinationAdded = true;
  bus.addDestination({
    name: "gtm",
    setup({ subscribe }) {
      subscribe(AnalyticsEvent.PAGE_VIEWED, (data) => {
        window.dataLayer?.push({
          event: "page_viewed",
          page_url: data.url,
        });
      });
      subscribe(AnalyticsEvent.PRODUCT_VIEWED, (data) => {
        const product = data.products?.[0];
        window.dataLayer?.push({
          event: "product_viewed",
          product_id: product?.id,
          product_name: product?.title,
          // Classic payloads carried the price amount as a string; the bus
          // carries the `MoneyV2`.
          product_price: product?.price?.amount,
          product_url: product?.url,
        });
      });
      subscribe(AnalyticsEvent.COLLECTION_VIEWED, (data) => {
        window.dataLayer?.push({
          event: "collection_viewed",
          collection_handle: data.collection?.handle,
        });
      });
      subscribe(AnalyticsEvent.CART_UPDATED, (data) => {
        window.dataLayer?.push({
          event: "cart_updated",
          cart_id: data.cart?.id,
          cart_total: getCartTotal(data.cart),
          cart_total_quantity: getCartQuantity(data.cart),
        });
      });
      subscribe(AnalyticsEvent.PRODUCT_ADD_TO_CART, () => {
        window.dataLayer?.push({ event: "add_to_cart" });
      });
      subscribe(AnalyticsEvent.PRODUCT_REMOVED_FROM_CART, () => {
        window.dataLayer?.push({ event: "remove_from_cart" });
      });
      subscribe(AnalyticsEvent.SEARCH_VIEWED, () => {
        window.dataLayer?.push({ event: "search_viewed" });
      });
    },
  });
}

// The cart tracker passes the store's full `cost` through; the payload type
// only declares its currency codes.
function getCartTotal(cart: AnalyticsCart | null) {
  const total = cart?.cost?.totalAmount as { amount?: string } | undefined;
  return total?.amount;
}

// The analytics cart has no `totalQuantity`; it is the sum of line quantities.
function getCartQuantity(cart: AnalyticsCart | null) {
  if (!cart) {
    return undefined;
  }
  const lines =
    cart.lines.nodes ?? cart.lines.edges?.map(({ node }) => node) ?? [];
  return lines.reduce((total, line) => total + line.quantity, 0);
}

export function CustomAnalytics() {
  let nonce = useNonce();
  let rootData = useRouteLoaderData<RootLoader>("root");
  let id = rootData?.googleGtmID;

  useEffect(() => {
    // Queue immediately; GTM network loading is intentionally delayed below.
    // Events pushed before gtm.js loads are processed once it does.
    window.dataLayer = window.dataLayer || [];
    addGtmDestination();
  }, []);

  useEffect(() => {
    if (!id) {
      return;
    }

    window.dataLayer = window.dataLayer || [];

    let didLoad = false;
    let fallbackTimer: number | undefined;
    let cleanupEvents: (() => void) | undefined;

    function loadGtm() {
      if (didLoad) {
        return;
      }
      didLoad = true;
      cleanupEvents?.();
      if (fallbackTimer) {
        window.clearTimeout(fallbackTimer);
      }

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
      window.dataLayer.push(["js", new Date()]);
      window.dataLayer.push(["config", id]);

      const script = document.createElement("script");
      script.async = true;
      script.nonce = nonce;
      script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`;
      document.head.appendChild(script);
    }

    const intentEvents = ["pointerdown", "keydown", "touchstart", "scroll"];
    for (const event of intentEvents) {
      window.addEventListener(event, loadGtm, {
        once: true,
        passive: true,
      });
    }
    cleanupEvents = () => {
      for (const event of intentEvents) {
        window.removeEventListener(event, loadGtm);
      }
    };

    // Long-tail fallback: keep analytics for no-interaction page views, but
    // keep GTM out of the initial render/LCP window. User intent loads sooner.
    fallbackTimer = window.setTimeout(loadGtm, 8000);

    return () => {
      cleanupEvents?.();
      if (fallbackTimer) {
        window.clearTimeout(fallbackTimer);
      }
    };
  }, [id, nonce]);

  return null;
}
