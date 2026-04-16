import { CartForm } from "@shopify/hydrogen";
import { useEffect, useRef } from "react";
import type { Fetcher } from "react-router";
import { useFetchers, useRouteLoaderData } from "react-router";
import type { CartApiQueryFragment } from "storefront-api.generated";
import type { RootLoader } from "~/root";
import { create } from "zustand";

type CartStore = {
  isOpen: boolean;
  serverCart: CartApiQueryFragment | null;
  open: () => void;
  close: () => void;
  toggle: (open?: boolean) => void;
};

export const useCartStore = create<CartStore>()((set) => ({
  isOpen: false,
  serverCart: null,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: (open) =>
    set((state) => ({ isOpen: open !== undefined ? open : !state.isOpen })),
}));

/**
 * Module-level ref to track the freshest completed fetcher cart.
 * This survives component unmounts, which is crucial for handling the
 * flash-back bug when the remove button component unmounts before
 * the fetcher completes.
 */
const freshestFetcherCartRef = {
  cart: null as CartApiQueryFragment | null,
  updatedAt: "",
};

type OptimisticLineNode = CartApiQueryFragment["lines"]["nodes"][number] & {
  isOptimistic?: boolean;
};

type CartWithOptimistic = CartApiQueryFragment & { isOptimistic?: boolean };

function applyOptimisticMutations(
  baseline: CartApiQueryFragment,
  fetchers: ReturnType<typeof useFetchers>,
): CartWithOptimistic | null {
  const pendingFetchers = fetchers.filter(
    (f) => f.state !== "idle" && f.formData,
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
    const { action, inputs } = CartForm.getFormInput(fetcher.formData!);
    const nodes = cart.lines.nodes;

    if (action === CartForm.ACTIONS.LinesAdd) {
      for (const line of inputs?.lines ?? []) {
        if (!line.selectedVariant) continue;
        const existingIdx = nodes.findIndex(
          (n) => n.merchandise?.id === line.selectedVariant?.id,
        );
        mutated = true;
        if (existingIdx !== -1) {
          const cloned = { ...nodes[existingIdx] } as OptimisticLineNode;
          cloned.quantity = (cloned.quantity || 1) + (line.quantity || 1);
          cloned.isOptimistic = true;
          nodes[existingIdx] = cloned;
        } else {
          nodes.unshift({
            id: `optimistic-${crypto.randomUUID()}`,
            merchandise: line.selectedVariant,
            isOptimistic: true,
            quantity: line.quantity || 1,
          } as OptimisticLineNode);
        }
      }
    } else if (action === CartForm.ACTIONS.LinesRemove) {
      for (const lineId of (inputs?.lineIds as string[]) ?? []) {
        const idx = nodes.findIndex((n) => n.id === lineId);
        if (idx !== -1) {
          nodes.splice(idx, 1);
          mutated = true;
        }
      }
    } else if (action === CartForm.ACTIONS.LinesUpdate) {
      for (const update of inputs?.lines ?? []) {
        const idx = nodes.findIndex((n) => n.id === update.id);
        if (idx !== -1) {
          const cloned = { ...nodes[idx] } as OptimisticLineNode;
          cloned.quantity = update.quantity;
          cloned.isOptimistic = true;
          if (cloned.quantity === 0) {
            nodes.splice(idx, 1);
          } else {
            nodes[idx] = cloned;
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

function findFreshestCart(
  serverCart: CartApiQueryFragment | null,
  fetchers: ReturnType<typeof useFetchers>,
): CartApiQueryFragment | null {
  let freshest = serverCart;
  let freshestTime = getTimestampMs(serverCart?.updatedAt);

  for (const fetcher of fetchers) {
    const fetcherCart = fetcher.data?.cart as CartApiQueryFragment | undefined;
    if (fetcher.state === "idle" && fetcherCart?.id && fetcherCart?.lines) {
      const t = getTimestampMs(fetcherCart.updatedAt);
      if (t > freshestTime) {
        freshest = fetcherCart;
        freshestTime = t;
        freshestFetcherCartRef.cart = fetcherCart;
        freshestFetcherCartRef.updatedAt = fetcherCart.updatedAt;
      }
    }
  }

  if (freshestFetcherCartRef.cart) {
    const refTime = getTimestampMs(freshestFetcherCartRef.updatedAt);
    if (refTime > freshestTime) {
      freshest = freshestFetcherCartRef.cart;
    }
  }

  return freshest;
}

export function useCart(): CartWithOptimistic | null {
  const serverCart = useCartStore((s) => s.serverCart);
  const fetchers = useFetchers();
  const baseline = findFreshestCart(serverCart, fetchers);

  const optimisticCart =
    baseline && fetchers.length > 0
      ? applyOptimisticMutations(baseline, fetchers)
      : null;

  if (!baseline) return null;

  return optimisticCart ?? baseline;
}

/**
 * Syncs cart data from root loader's deferred promise into zustand.
 * Uses `updatedAt` to skip stale root loader data when a fetcher
 * already synced fresher post-mutation cart state.
 */
export function CartStoreSync() {
  const rootData = useRouteLoaderData<RootLoader>("root");
  const promiseRef = useRef<unknown>(null);
  const cartPromise = rootData?.cart;

  useEffect(() => {
    if (cartPromise && cartPromise !== promiseRef.current) {
      promiseRef.current = cartPromise;
      Promise.resolve(cartPromise)
        .then((resolved) => {
          if (!resolved) {
            useCartStore.setState({ serverCart: null });
            return;
          }
          const current = useCartStore.getState().serverCart;
          const resolvedTime = new Date(resolved.updatedAt).getTime();
          const currentTime = current?.updatedAt
            ? new Date(current.updatedAt).getTime()
            : 0;
          if (resolvedTime >= currentTime) {
            useCartStore.setState({ serverCart: resolved });
          }
        })
        .catch(() => {
          // Cart fetch failed — leave current state as-is
        });
    }
  }, [cartPromise]);

  return null;
}
