import type { Fetcher } from "react-router";
import type { CartApiQueryFragment } from "storefront-api.generated";
import { hasCartResponseErrors } from "~/utils/cart-note";

let freshestFetcherCart: CartApiQueryFragment | null = null;
let cartMutationEpoch = 0;
let cartBootstrapRequestSeq = 0;
let currentCartBootstrapLocationKey = "";
let currentCartBootstrapPath = "";
let currentCartBootstrapRequestToken: string | null = null;
let currentCartBootstrapMutationEpoch = 0;

/**
 * Converts Shopify's cart timestamp to a comparable value.
 */
export function getTimestampMs(dateString: string | undefined): number {
  return dateString ? new Date(dateString).getTime() : 0;
}

/**
 * Records a completed cart mutation for freshness selection and null-bootstrap
 * race protection.
 */
export function recordCartMutation(cart: CartApiQueryFragment) {
  cartMutationEpoch += 1;
  if (
    !freshestFetcherCart ||
    getTimestampMs(cart.updatedAt) >=
      getTimestampMs(freshestFetcherCart.updatedAt)
  ) {
    freshestFetcherCart = cart;
  }
}

/**
 * Clears the mutation-derived baseline after an authoritative empty bootstrap.
 */
export function clearFreshestFetcherCart() {
  freshestFetcherCart = null;
}

/**
 * Scans all authoritative sources and returns the freshest cart baseline.
 *
 * The optional fetcher scan is render-only. It recovers completed mutations
 * whose owning component unmounted before `useCartFetcherSync()` could observe
 * them.
 */
export function resolveBaselineCart(
  serverCart: CartApiQueryFragment | null,
  fetchers: Fetcher<unknown>[] = [],
) {
  let cart = serverCart;
  let updatedAt = getTimestampMs(serverCart?.updatedAt);

  const freshestFetcherTime = getTimestampMs(freshestFetcherCart?.updatedAt);
  if (freshestFetcherCart && freshestFetcherTime > updatedAt) {
    cart = freshestFetcherCart;
    updatedAt = freshestFetcherTime;
  }

  for (const fetcher of fetchers) {
    if (fetcher.state !== "idle") {
      continue;
    }
    const fetcherData = fetcher.data as Record<string, unknown> | undefined;
    if (hasCartResponseErrors(fetcherData)) {
      continue;
    }
    const fetcherCart = fetcherData?.cart as CartApiQueryFragment | undefined;
    if (!fetcherCart?.id || !fetcherCart.lines) {
      continue;
    }
    const fetcherTime = getTimestampMs(fetcherCart.updatedAt);
    if (fetcherTime > updatedAt) {
      cart = fetcherCart;
      updatedAt = fetcherTime;
      recordCartMutation(fetcherCart);
    }
  }

  return { cart, updatedAt };
}

/**
 * Returns the request token for the active location and locale-prefixed cart
 * endpoint.
 */
export function ensureCartBootstrapRequestToken(
  locationKey: string,
  path: string,
) {
  if (typeof document === "undefined") {
    return null;
  }
  if (
    currentCartBootstrapLocationKey !== locationKey ||
    currentCartBootstrapPath !== path
  ) {
    cartBootstrapRequestSeq += 1;
    currentCartBootstrapLocationKey = locationKey;
    currentCartBootstrapPath = path;
    currentCartBootstrapRequestToken = `${locationKey}:${cartBootstrapRequestSeq}`;
  }
  return currentCartBootstrapRequestToken;
}

/**
 * Returns the active bootstrap request identity used by analytics gating.
 */
export function getCurrentCartBootstrapRequestToken() {
  return currentCartBootstrapRequestToken;
}

/**
 * Returns the locale-prefixed endpoint associated with the active request.
 */
export function getCurrentCartBootstrapPath() {
  return currentCartBootstrapPath;
}

/**
 * Snapshots mutation state when the active bootstrap request starts.
 */
export function markCartBootstrapStarted() {
  currentCartBootstrapMutationEpoch = cartMutationEpoch;
}

/**
 * A null bootstrap can clear cart state only when no cart mutation landed
 * after the active request started.
 */
export function canApplyNullCartBootstrap() {
  return cartMutationEpoch === currentCartBootstrapMutationEpoch;
}
