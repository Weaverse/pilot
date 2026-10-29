import {
  type AnalyticsCart,
  AnalyticsEvent,
  type CollectionViewPayload,
  type ProductPayload,
  type SearchViewPayload,
} from "@shopify/hydrogen";
import { useCartAnalytics } from "@shopify/hydrogen/react";
import { useEffect } from "react";
import { useLocation } from "react-router";
import type { CartData } from "~/components/cart/cart-store";

/**
 * Route-level analytics events, published to the analytics bus that
 * `<ShopifyScripts>` creates (`window.Shopify.analytics`).
 *
 * They replace classic Hydrogen's `<Analytics.ProductView>`,
 * `<Analytics.CollectionView>`, `<Analytics.SearchView>` and
 * `<Analytics.CartView>`: render one in a route and it publishes once per URL.
 * Every consumer (Shopify, GTM) receives them through a bus destination,
 * gated by consent.
 */
function usePublishOnLocation(publish: () => void, ready = true) {
  const { pathname, search } = useLocation();
  // Publish once per URL, not on every `publish` identity change.
  // oxlint-disable-next-line react/exhaustive-deps
  useEffect(() => {
    if (ready) publish();
  }, [pathname, search, ready]);
}

function getBus() {
  return typeof window === "undefined" ? undefined : window.Shopify?.analytics;
}

export function ProductView({ products }: { products: ProductPayload[] }) {
  usePublishOnLocation(
    () => getBus()?.publish(AnalyticsEvent.PRODUCT_VIEWED, { products }),
    products.length > 0,
  );
  return null;
}

export function CollectionView({
  collection,
}: Pick<CollectionViewPayload, "collection">) {
  usePublishOnLocation(() =>
    getBus()?.publish(AnalyticsEvent.COLLECTION_VIEWED, { collection }),
  );
  return null;
}

export function SearchView({
  searchTerm,
  searchResults,
}: Pick<SearchViewPayload, "searchTerm" | "searchResults">) {
  usePublishOnLocation(() =>
    getBus()?.publish(AnalyticsEvent.SEARCH_VIEWED, {
      searchTerm,
      searchResults,
    }),
  );
  return null;
}

/**
 * The analytics bus's cart shape from the cart store's. Optimistic lines,
 * which lack the product fields Shopify analytics needs, are left out; a cart
 * without an `id` (empty) is `null`.
 */
export function toAnalyticsCart(cart: CartData | null): AnalyticsCart | null {
  if (!cart?.id) return null;
  return {
    id: cart.id,
    updatedAt: cart.updatedAt ?? new Date().toISOString(),
    cost: cart.cost,
    lines: {
      nodes: cart.lines.nodes.flatMap((line) => {
        const merchandise = line.merchandise;
        const product = merchandise?.product;
        if (!merchandise?.id || !product?.id) return [];
        return [
          {
            id: line.id,
            quantity: line.quantity,
            merchandise: {
              id: merchandise.id,
              title: merchandise.title ?? product.title,
              sku: merchandise.sku ?? null,
              price: line.cost.amountPerQuantity,
              product: {
                id: product.id,
                title: product.title,
                vendor: product.vendor ?? "",
                productType: product.productType ?? undefined,
                handle: product.handle,
              },
            },
          },
        ];
      }),
    },
  };
}

/**
 * Publishes `cart_viewed` once per visit, when the cart store has loaded
 * (`ready`). An empty cart publishes `cart: null`, as classic Hydrogen's
 * `<Analytics.CartView>` did for every resolved cart.
 */
export function CartView({
  cart,
  ready,
}: {
  cart: CartData | null;
  ready: boolean;
}) {
  usePublishOnLocation(
    () =>
      getBus()?.publish(AnalyticsEvent.CART_VIEWED, {
        cart: toAnalyticsCart(cart),
      }),
    ready,
  );
  return null;
}

/** Publishes `page_viewed` on load and on every pathname/search change. */
export function PageView() {
  usePublishOnLocation(() => getBus()?.publish(AnalyticsEvent.PAGE_VIEWED));
  return null;
}

/**
 * Publishes `cart_updated`, `product_added_to_cart` and
 * `product_removed_from_cart` from confirmed cart store changes. Render once,
 * inside `CartProvider`, after `<ShopifyScripts>` (the hook throws without
 * the bus).
 */
export function CartAnalytics() {
  useCartAnalytics();
  return null;
}
