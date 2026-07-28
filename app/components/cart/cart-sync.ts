import { useEffect, useLayoutEffect, useRef } from "react";
import type { Fetcher } from "react-router";
import { useFetcher, useLocation, useNavigation } from "react-router";
import type { CartApiQueryFragment } from "storefront-api.generated";
import { usePrefixPathWithLocale } from "~/hooks/use-prefix-path-with-locale";
import type { loader as apiCartLoader } from "~/routes/api/cart";
import { hasCartResponseErrors } from "~/utils/cart-note";
import {
  canApplyNullCartBootstrap,
  clearFreshestFetcherCart,
  ensureCartBootstrapRequestToken,
  getCurrentCartBootstrapPath,
  getCurrentCartBootstrapRequestToken,
  getTimestampMs,
  markCartBootstrapStarted,
  recordCartMutation,
} from "./cart-baseline";
import { type CartStore, useCartStore } from "./store";

const useHydrationSafeLayoutEffect =
  typeof document === "undefined" ? useEffect : useLayoutEffect;

/**
 * Captures an authoritative mutation result before React Router discards its
 * singular fetcher.
 */
export function useCartFetcherSync(fetcher: Fetcher<unknown>) {
  const lastSyncedRef = useRef<string | null>(null);
  const fetcherData = fetcher.data as Record<string, unknown> | undefined;
  const cart = fetcherData?.cart as CartApiQueryFragment | undefined;
  if (
    fetcher.state === "idle" &&
    !hasCartResponseErrors(fetcherData) &&
    cart?.id &&
    cart.lines
  ) {
    const updatedAt = cart.updatedAt;
    if (updatedAt !== lastSyncedRef.current) {
      lastSyncedRef.current = updatedAt;
      recordCartMutation(cart);
      const current = useCartStore.getState().serverCart;
      if (
        getTimestampMs(cart.updatedAt) >= getTimestampMs(current?.updatedAt)
      ) {
        // Syncing during render avoids a frame where the pending overlay has
        // disappeared but the confirmed cart has not reached zustand yet.
        queueMicrotask(() => {
          useCartStore.setState({ serverCart: cart });
        });
      }
    }
  }
}

/**
 * Bootstraps personalized cart and customer-account state after hydration.
 *
 * Keeping this data out of the SSR document preserves the anonymous full-page
 * cache. Request-token and mutation-epoch guards prevent stale locale or
 * pre-cookie responses from replacing newer mutation results.
 */
export function CartStoreSync() {
  const fetcher = useFetcher<typeof apiCartLoader>();
  const load = fetcher.load;
  const apiCartPath = usePrefixPathWithLocale("/api/cart");
  const location = useLocation();
  const navigation = useNavigation();
  const isAuthRelevantSubmission =
    navigation.state !== "idle" &&
    navigation.formMethod != null &&
    navigation.formMethod !== "GET";

  useEffect(() => {
    if (isAuthRelevantSubmission) {
      useCartStore.setState({ customerAccessTokenKnown: false });
    }
  }, [isAuthRelevantSubmission]);

  const cartRequestToken = ensureCartBootstrapRequestToken(
    location.key,
    apiCartPath,
  );
  useHydrationSafeLayoutEffect(() => {
    if (!cartRequestToken) {
      return;
    }
    markCartBootstrapStarted();
    const url = new URL(apiCartPath, window.location.origin);
    url.searchParams.set("cartRequestToken", cartRequestToken);
    load(url.pathname + url.search);
  }, [load, apiCartPath, cartRequestToken]);

  const payload = fetcher.data;
  useEffect(() => {
    if (!payload) {
      return;
    }
    const responseToken = payload.cartRequestToken ?? null;
    if (
      !responseToken ||
      responseToken !== getCurrentCartBootstrapRequestToken()
    ) {
      return;
    }
    // The response gate and personalized state must update atomically; split
    // writes could let consumers render or publish from a stale cart.
    const updates: Partial<CartStore> = {
      customerAccessToken: payload.customerAccessToken,
      cartBootstrapResponseToken: responseToken,
      cartBootstrapResolvedPath: getCurrentCartBootstrapPath(),
      customerAccessTokenKnown: !isAuthRelevantSubmission,
    };
    const resolved = payload.cart;
    if (resolved) {
      const current = useCartStore.getState().serverCart;
      if (
        getTimestampMs(resolved.updatedAt) >= getTimestampMs(current?.updatedAt)
      ) {
        updates.serverCart = resolved as CartApiQueryFragment;
      }
    } else if (canApplyNullCartBootstrap()) {
      clearFreshestFetcherCart();
      updates.serverCart = null;
    }
    useCartStore.setState(updates);
  }, [payload, isAuthRelevantSubmission]);

  return null;
}
