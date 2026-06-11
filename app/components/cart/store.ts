import { CartForm } from "@shopify/hydrogen";
import { useEffect, useLayoutEffect, useRef } from "react";
import type { Fetcher } from "react-router";
import { useFetcher, useFetchers, useLocation } from "react-router";
import type { CartApiQueryFragment } from "storefront-api.generated";
import { create } from "zustand";
import { usePrefixPathWithLocale } from "~/hooks/use-prefix-path-with-locale";
import type { loader as apiCartLoader } from "~/routes/api/cart";

type CartStore = {
  isOpen: boolean;
  serverCart: CartApiQueryFragment | null;
  /**
   * Customer Account API access token for the Shopify account web component.
   * Bootstrapped client-side via /api/cart — it must never be embedded in
   * the SSR document (see entry.server.tsx full-page cache notes).
   */
  customerAccessToken: string | null;
  /**
   * Unique /api/cart bootstrap request token currently in flight, and the
   * token whose response has been applied. Components whose analytics need an
   * authoritative cart (e.g. <Analytics.CartView>, whose publish effect is
   * keyed on URL and never replays when the cart context updates) must wait
   * until these match. React Router history keys can be reused on back/forward
   * navigation, so a per-request token is required.
   */
  cartBootstrapRequestToken: string | null;
  cartBootstrapResponseToken: string | null;
  open: () => void;
  close: () => void;
  toggle: (open?: boolean) => void;
};

export const useCartStore = create<CartStore>()((set) => ({
  isOpen: false,
  serverCart: null,
  customerAccessToken: null,
  cartBootstrapRequestToken: null,
  cartBootstrapResponseToken: null,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: (open) =>
    set((state) => ({ isOpen: open !== undefined ? open : !state.isOpen })),
}));

const freshestFetcherCartRef = {
  cart: null as CartApiQueryFragment | null,
  updatedAt: "",
};
/**
 * Counts mutation-fetcher cart syncs. CartStoreSync snapshots this before
 * each /api/cart load: a `cart: null` bootstrap response is only allowed to
 * clear the store when no mutation landed in between — otherwise a slow
 * pre-cookie bootstrap would wipe a cart the shopper just created.
 */
let cartMutationEpoch = 0;

let cartBootstrapRequestSeq = 0;

const useHydrationSafeLayoutEffect =
  typeof document === "undefined" ? useEffect : useLayoutEffect;

/**
 * Module-level set of line IDs that have been optimistically removed.
 * These are filtered from the baseline cart until the server cart
 * confirms the lines are gone. This is necessary because React Router
 * cleans up fetchers from unmounted components synchronously — the
 * remove fetcher's response is never visible via useFetchers().
 */
const removedLineIds = new Set<string>();

type OptimisticLineNode = CartApiQueryFragment["lines"]["nodes"][number] & {
  isOptimistic?: boolean;
};

type CartWithOptimistic = CartApiQueryFragment & { isOptimistic?: boolean };

function applyOptimisticMutations(
  baseline: CartApiQueryFragment,
  fetchers: ReturnType<typeof useFetchers>,
): CartWithOptimistic | null {
  const pendingFetchers = fetchers.filter(
    (f) => f.state === "submitting" && f.formData,
  );
  if (pendingFetchers.length === 0) {
    return null;
  }

  const nodes = [...baseline.lines.nodes] as OptimisticLineNode[];
  const cart = {
    ...baseline,
    lines: { ...baseline.lines, nodes },
    totalQuantity: baseline.totalQuantity,
    isOptimistic: false,
  } as CartWithOptimistic & {
    lines: { nodes: OptimisticLineNode[] };
    totalQuantity: number;
  };
  let mutated = false;

  for (const fetcher of pendingFetchers) {
    const formData = fetcher.formData;
    if (!formData) {
      continue;
    }
    const { action, inputs } = CartForm.getFormInput(formData);
    const lineNodes = cart.lines.nodes;

    if (action === CartForm.ACTIONS.LinesAdd) {
      for (const line of inputs?.lines ?? []) {
        const selectedVariant =
          line.selectedVariant as OptimisticLineNode["merchandise"];
        if (!selectedVariant) {
          continue;
        }
        const existingIdx = lineNodes.findIndex(
          (n) => n.merchandise?.id === selectedVariant.id,
        );
        mutated = true;
        if (existingIdx !== -1) {
          const cloned = { ...lineNodes[existingIdx] } as OptimisticLineNode;
          cloned.quantity = (cloned.quantity || 1) + (line.quantity || 1);
          cloned.isOptimistic = true;
          lineNodes[existingIdx] = cloned;
        } else {
          lineNodes.unshift({
            id: `optimistic-${crypto.randomUUID()}`,
            merchandise: selectedVariant,
            isOptimistic: true,
            quantity: line.quantity || 1,
          } as OptimisticLineNode);
        }
      }
    } else if (action === CartForm.ACTIONS.LinesRemove) {
      for (const lineId of (inputs?.lineIds as string[]) ?? []) {
        const idx = lineNodes.findIndex((n) => n.id === lineId);
        if (idx !== -1) {
          lineNodes.splice(idx, 1);
          mutated = true;
        }
        removedLineIds.add(lineId);
      }
    } else if (action === CartForm.ACTIONS.LinesUpdate) {
      for (const update of inputs?.lines ?? []) {
        const idx = lineNodes.findIndex((n) => n.id === update.id);
        if (idx !== -1) {
          const cloned = { ...lineNodes[idx] } as OptimisticLineNode;
          cloned.quantity = update.quantity;
          cloned.isOptimistic = true;
          if (cloned.quantity === 0) {
            lineNodes.splice(idx, 1);
          } else {
            lineNodes[idx] = cloned;
          }
          mutated = true;
        }
      }
    } else {
      mutated = true;
    }
  }

  if (!mutated) {
    return null;
  }

  cart.totalQuantity = cart.lines.nodes.reduce(
    (sum, line) => sum + line.quantity,
    0,
  );
  cart.isOptimistic = true;
  return cart;
}

/**
 * Syncs cart data from a singular fetcher instance into zustand.
 *
 * WHY: `useFetchers()` (plural) reads from `state.fetchers` map which
 * React Router deletes idle fetchers from on the same synchronous tick
 * as completion. The singular `useFetcher()` preserves data via a
 * `fetcherData` ref that survives cleanup. By syncing from individual
 * fetcher instances, we reliably capture post-mutation cart state.
 *
 * SYNC DURING RENDER: We sync to zustand during render (not in useEffect)
 * so that `useCart()` reads the fresh serverCart in the same render cycle.
 * Without this, there's a 1-frame flash where optimistic mutations are
 * cleared (fetcher is idle) but serverCart hasn't been updated yet.
 * `queueMicrotask` is used to avoid React's "setState during render" warning.
 */
export function useCartFetcherSync(fetcher: Fetcher<unknown>) {
  const lastSyncedRef = useRef<string | null>(null);
  const fetcherData = fetcher.data as Record<string, unknown> | undefined;
  const cart = fetcherData?.cart as CartApiQueryFragment | undefined;
  if (fetcher.state === "idle" && cart?.id && cart?.lines) {
    const updatedAt = cart.updatedAt;
    if (updatedAt !== lastSyncedRef.current) {
      lastSyncedRef.current = updatedAt;
      cartMutationEpoch += 1;
      const fetcherCart = cart as CartApiQueryFragment;
      const fetcherTime = new Date(fetcherCart.updatedAt).getTime();
      const refTime = freshestFetcherCartRef.updatedAt
        ? new Date(freshestFetcherCartRef.updatedAt).getTime()
        : 0;
      if (fetcherTime >= refTime) {
        freshestFetcherCartRef.cart = fetcherCart;
        freshestFetcherCartRef.updatedAt = fetcherCart.updatedAt;
      }
      const current = useCartStore.getState().serverCart;
      const currentTime = current?.updatedAt
        ? new Date(current.updatedAt).getTime()
        : 0;
      if (fetcherTime >= currentTime) {
        queueMicrotask(() => {
          useCartStore.setState({ serverCart: fetcherCart });
        });
      }
    }
  }
}

function getTimestampMs(dateString: string | undefined): number {
  return dateString ? new Date(dateString).getTime() : 0;
}

/**
 * Scans all sources (zustand, fetchers, module ref) and returns the
 * freshest cart as baseline, then applies pending optimistic mutations.
 *
 * The fetcher scan here is critical: when a remove button's component
 * unmounts before its fetcher completes, useCartFetcherSync never fires.
 * Scanning useFetchers() in THIS hook (same render pass) catches those
 * completed carts that would otherwise be lost.
 *
 * Only the SINGLE freshest completed cart is used as baseline — not
 * accumulated across multiple fetchers — to avoid double-counting.
 */
export function useCart(): CartWithOptimistic | null {
  const serverCart = useCartStore((s) => s.serverCart);
  const fetchers = useFetchers();

  let baseline = serverCart;
  let baselineTime = getTimestampMs(serverCart?.updatedAt);
  let baselineSource = "zustand";

  const refTime = getTimestampMs(freshestFetcherCartRef.updatedAt);
  if (freshestFetcherCartRef.cart && refTime > baselineTime) {
    baseline = freshestFetcherCartRef.cart;
    baselineTime = refTime;
    baselineSource = "moduleRef";
  }

  for (const fetcher of fetchers) {
    if (fetcher.state !== "idle") {
      continue;
    }
    const fetcherData = fetcher.data as Record<string, unknown> | undefined;
    const cart = fetcherData?.cart as CartApiQueryFragment | undefined;
    if (!cart?.id || !cart?.lines) {
      continue;
    }
    const t = getTimestampMs(cart.updatedAt);
    if (t > baselineTime) {
      baseline = cart;
      baselineTime = t;
      baselineSource = `fetcher(${fetcher.key})`;
      freshestFetcherCartRef.cart = cart;
      freshestFetcherCartRef.updatedAt = cart.updatedAt;
      // This fallback scan is the only place that can see completed
      // fetchers after React Router drops their components. Treat it as a
      // real mutation sync for null-bootstrap race guards too.
      cartMutationEpoch += 1;
    }
  }

  if (!baseline) {
    return null;
  }

  // Filter tombstoned lines from baseline — prevents flash-back when
  // the remove fetcher's response is lost due to component unmount
  if (removedLineIds.size > 0) {
    const baselineLineIds = new Set(baseline.lines.nodes.map((n) => n.id));
    const confirmedRemovals: string[] = [];
    for (const id of removedLineIds) {
      if (!baselineLineIds.has(id)) {
        confirmedRemovals.push(id);
      }
    }
    for (const id of confirmedRemovals) {
      removedLineIds.delete(id);
    }

    if (removedLineIds.size > 0) {
      const filteredNodes = baseline.lines.nodes.filter(
        (n) => !removedLineIds.has(n.id),
      );
      baseline = {
        ...baseline,
        lines: { ...baseline.lines, nodes: filteredNodes },
        totalQuantity: filteredNodes.reduce(
          (sum, line) => sum + line.quantity,
          0,
        ),
      };
    }
  }

  const optimisticCart =
    fetchers.length > 0 ? applyOptimisticMutations(baseline, fetchers) : null;

  return optimisticCart ?? baseline;
}

/**
 * Bootstraps personalized state (cart + customer access token) client-side
 * from /api/cart after hydration.
 *
 * This data used to come from the root loader's deferred promise, but
 * deferred values stream into the SSR document — personalizing every page
 * and blocking Oxygen's full-page cache (see entry.server.tsx). Fetching
 * after hydration keeps the document anonymous.
 *
 * The load is locale-prefixed so the cart query runs in the active market's
 * i18n context (a bare `/api/cart` would price the cart in the default
 * locale), and it re-runs on every navigation (`location.key`) — matching
 * the old root-loader revalidation that refreshed the token after auth
 * actions (e.g. logout redirect) and picked up carts mutated by GET-loader
 * redirects (e.g. discount-code routes).
 *
 * Post-mutation freshness is handled by `useCartFetcherSync`. Two race
 * guards protect against this bootstrap resolving after a faster mutation
 * fetcher: the `updatedAt` comparison for non-empty carts, and the
 * `cartMutationEpoch` snapshot for `cart: null` responses (which carry no
 * timestamp to compare).
 */
export function CartStoreSync() {
  const fetcher = useFetcher<typeof apiCartLoader>();
  const load = fetcher.load;
  const apiCartPath = usePrefixPathWithLocale("/api/cart");
  const location = useLocation();
  const epochAtLoadRef = useRef(0);
  useHydrationSafeLayoutEffect(() => {
    epochAtLoadRef.current = cartMutationEpoch;
    cartBootstrapRequestSeq += 1;
    const cartRequestToken = `${location.key}:${cartBootstrapRequestSeq}`;
    useCartStore.setState({ cartBootstrapRequestToken: cartRequestToken });
    const url = new URL(apiCartPath, window.location.origin);
    url.searchParams.set("cartRequestToken", cartRequestToken);
    load(url.pathname + url.search);
  }, [load, apiCartPath, location.key]);
  const payload = fetcher.data;
  useEffect(() => {
    if (!payload) {
      return;
    }
    useCartStore.setState({
      customerAccessToken: payload.customerAccessToken,
      cartBootstrapResponseToken: payload.cartRequestToken ?? null,
    });
    const resolved = payload.cart;
    if (!resolved) {
      // Only clear when no mutation synced since this load was issued —
      // a slow pre-cookie bootstrap must not wipe a just-created cart.
      if (cartMutationEpoch === epochAtLoadRef.current) {
        // Reset the module ref too: useCart() consults it before the store,
        // so a surviving entry would keep resurrecting a cart whose cookie
        // expired or was completed at checkout.
        freshestFetcherCartRef.cart = null;
        freshestFetcherCartRef.updatedAt = "";
        useCartStore.setState({ serverCart: null });
      }
      return;
    }
    const current = useCartStore.getState().serverCart;
    const resolvedTime = new Date(resolved.updatedAt).getTime();
    const currentTime = current?.updatedAt
      ? new Date(current.updatedAt).getTime()
      : 0;
    if (resolvedTime >= currentTime) {
      useCartStore.setState({ serverCart: resolved as CartApiQueryFragment });
    }
  }, [payload]);
  return null;
}
