import { CartForm } from "@shopify/hydrogen";
import { useEffect, useRef } from "react";
import type { Fetcher } from "react-router";
import { useFetchers, useRouteLoaderData } from "react-router";
import type { CartApiQueryFragment } from "storefront-api.generated";
import { create } from "zustand";
import type { RootLoader } from "~/root";

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

const freshestFetcherCartRef = {
  cart: null as CartApiQueryFragment | null,
  updatedAt: "",
};

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
 * Syncs cart data from root loader's deferred promise into zustand.
 * Uses `updatedAt` to skip stale root loader data when a fetcher
 * already synced fresher post-mutation cart state.
 *
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
